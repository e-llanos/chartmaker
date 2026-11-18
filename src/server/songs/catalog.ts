import 'server-only';

import { and, asc, count, desc, eq, isNotNull, or, sql, type AnyColumn, type SQL } from 'drizzle-orm';
import type { ChartStyle } from '@/domain/chart/types';
import {
    PAGE_SIZE,
    type AlbumSummary,
    type ArtistSummary,
    type SongListItem,
    type SongPage,
    type SongQuery,
} from '@/domain/song/query';
import { getDb } from '@/server/db/client';
import { albums, artists, songFavorites, songs } from '@/server/db/schema';

/** Los comodines de LIKE (% _ \) se escriben tal cual en lo que busca el usuario. */
const escapeLike = (text: string): string => text.replace(/[\\%_]/g, '\\$&');

/** Sin tildes ni mayúsculas. Usa la extensión `unaccent` directamente, sin funciones propias. */
const norm = (value: AnyColumn | SQL | string) => sql`unaccent(lower(${value}::text))`;

/** Las palabras de 4 letras o más también admiten pequeños errores. Sube el umbral para ser más estricto. */
const MIN_FUZZY_LENGTH = 4;
const FUZZY_THRESHOLD = 0.45;

/** Cada palabra de la búsqueda debe aparecer en alguna de las columnas (y, si se pide, en la letra). */
function matchText(q: string, columns: AnyColumn[], lyrics?: AnyColumn): SQL | undefined {
    const words = q.split(/\s+/).filter(Boolean).slice(0, 6);
    if (words.length === 0) return undefined;

    return and(
        ...words.map((word) => {
            const pattern = `%${escapeLike(word)}%`;
            const checks = columns.flatMap((column) => [
                sql`${norm(column)} like ${norm(pattern)}`,
                ...(word.length >= MIN_FUZZY_LENGTH
                    ? [sql`word_similarity(${norm(word)}, ${norm(column)}) >= ${FUZZY_THRESHOLD}::real`]
                    : []),
            ]);
            if (lyrics) checks.push(sql`${norm(lyrics)} like ${norm(pattern)}`);
            return or(...checks);
        }),
    );
}

/** Qué tanto se parece la búsqueda al título, al artista o al álbum. */
const relevance = (q: string): SQL =>
    sql`greatest(
        word_similarity(${norm(q)}, ${norm(songs.title)}),
        word_similarity(${norm(q)}, ${norm(songs.artist)}),
        word_similarity(${norm(q)}, ${norm(songs.album)})
    )`;

const SORT_COLUMNS = {
    created: songs.createdAt,
    recent: songs.updatedAt,
    title: songs.title,
    artist: songs.artist,
    key: songs.key,
    tempo: songs.tempo,
} as const;

const sectionCount = sql<number>`coalesce(jsonb_array_length(${songs.chart} -> 'sections'), 0)`;

export interface SearchOptions {
    /** Usuario que consulta: activa las canciones guardadas. */
    userId?: string;
    includeLyrics?: boolean;
    pageSize?: number;
}

export async function searchSongs(query: SongQuery, options: SearchOptions = {}): Promise<SongPage> {
    const { userId, includeLyrics = false, pageSize = PAGE_SIZE } = options;
    const db = getDb();

    // Se une la tabla de guardadas solo para el usuario actual; sin usuario nunca coincide.
    const joinOn = and(eq(songFavorites.songId, songs.id), userId ? eq(songFavorites.userId, userId) : sql`false`);

    const where = and(
        matchText(query.q, [songs.title, songs.artist, songs.album], includeLyrics ? songs.body : undefined),
        query.artist ? eq(songs.artistId, query.artist) : undefined,
        query.album ? eq(songs.albumId, query.album) : undefined,
        query.key ? eq(songs.key, query.key) : undefined,
        query.withChart ? sql`${sectionCount} > 0` : undefined,
        query.view === 'saved' ? isNotNull(songFavorites.songId) : undefined,
    );

    const [counted] = await db.select({ total: count() }).from(songs).leftJoin(songFavorites, joinOn).where(where);
    const total = counted?.total ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(query.page, pageCount);

    const sortExpression: SQL | AnyColumn =
        query.sort === 'relevance' && query.q ? relevance(query.q) : SORT_COLUMNS[query.sort === 'relevance' ? 'created' : query.sort];

    const rows = await db
        .select({
            id: songs.id,
            title: songs.title,
            artist: songs.artist,
            album: songs.album,
            artistId: songs.artistId,
            albumId: songs.albumId,
            imageUrl: songs.imageUrl,
            key: songs.key,
            tempo: songs.tempo,
            compas: songs.compas,
            createdAt: songs.createdAt,
            updatedAt: songs.updatedAt,
            sections: sectionCount,
            chartStyle: sql<string | null>`${songs.chart} ->> 'style'`,
            isFavorite: sql<boolean>`${songFavorites.songId} is not null`,
        })
        .from(songs)
        .leftJoin(songFavorites, joinOn)
        .where(where)
        .orderBy(query.dir === 'desc' ? desc(sortExpression) : asc(sortExpression), asc(songs.title), asc(songs.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

    const items = rows.map<SongListItem>((r) => ({
        id: r.id,
        title: r.title,
        artist: r.artist,
        album: r.album,
        ...(r.artistId ? { artistId: r.artistId } : {}),
        ...(r.albumId ? { albumId: r.albumId } : {}),
        ...(r.imageUrl ? { imageUrl: r.imageUrl } : {}),
        key: r.key,
        tempo: r.tempo,
        compas: r.compas,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        hasChart: r.sections > 0,
        ...(r.sections > 0 && r.chartStyle ? { chartStyle: r.chartStyle as ChartStyle } : {}),
        isFavorite: Boolean(r.isFavorite),
    }));

    return { items, total, page, pageCount };
}

/** Artistas con más canciones primero. La búsqueda también acepta nombres aproximados. */
export async function listArtists(options: { q?: string; limit?: number } = {}): Promise<ArtistSummary[]> {
    const { q = '', limit = 24 } = options;
    const songCount = count(songs.id);
    const rows = await getDb()
        .select({ id: artists.id, name: artists.name, imageUrl: artists.imageUrl, songs: songCount })
        .from(artists)
        .innerJoin(songs, eq(songs.artistId, artists.id))
        .where(matchText(q, [artists.name]))
        .groupBy(artists.id)
        .orderBy(desc(songCount), asc(artists.name))
        .limit(limit);

    return rows.map((r) => ({
        id: r.id,
        name: r.name,
        songs: r.songs,
        ...(r.imageUrl ? { imageUrl: r.imageUrl } : {}),
    }));
}

/** Álbumes con más canciones primero; la portada es la del álbum o la de una de sus canciones. */
export async function listAlbums(options: { q?: string; limit?: number } = {}): Promise<AlbumSummary[]> {
    const { q = '', limit = 24 } = options;
    const songCount = count(songs.id);
    const rows = await getDb()
        .select({
            id: albums.id,
            title: albums.title,
            artistName: artists.name,
            cover: sql<string | null>`coalesce(${albums.imageUrl}, max(${songs.imageUrl}))`,
            songs: songCount,
        })
        .from(albums)
        .innerJoin(songs, eq(songs.albumId, albums.id))
        .leftJoin(artists, eq(albums.artistId, artists.id))
        .where(matchText(q, [albums.title, artists.name]))
        .groupBy(albums.id, artists.name)
        .orderBy(desc(songCount), asc(albums.title))
        .limit(limit);

    return rows.map((r) => ({
        id: r.id,
        title: r.title,
        songs: r.songs,
        ...(r.artistName ? { artistName: r.artistName } : {}),
        ...(r.cover ? { imageUrl: r.cover } : {}),
    }));
}

export async function getArtistName(id: string): Promise<string | null> {
    const [row] = await getDb().select({ name: artists.name }).from(artists).where(eq(artists.id, id)).limit(1);
    return row?.name ?? null;
}

export async function getAlbumInfo(id: string): Promise<{ title: string; artistName: string | null } | null> {
    const [row] = await getDb()
        .select({ title: albums.title, artistName: artists.name })
        .from(albums)
        .leftJoin(artists, eq(albums.artistId, artists.id))
        .where(eq(albums.id, id))
        .limit(1);
    return row ?? null;
}

export async function countSongs(): Promise<number> {
    const [row] = await getDb().select({ total: count() }).from(songs);
    return row?.total ?? 0;
}

export async function countSaved(userId: string): Promise<number> {
    const [row] = await getDb().select({ total: count() }).from(songFavorites).where(eq(songFavorites.userId, userId));
    return row?.total ?? 0;
}