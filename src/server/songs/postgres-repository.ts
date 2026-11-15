import 'server-only';

import { desc, eq, sql } from 'drizzle-orm';
import type { ChartStyle } from '@/domain/chart/types';
import { SCHEMA_VERSION } from '@/domain/song/migrate';
import type { Song, SongSummary } from '@/domain/song/types';
import { getDb } from '@/server/db/client';
import { songs, type NewSongRow, type SongRow } from '@/server/db/schema';
import type { SongRepository } from './repository';

function toSong(row: SongRow): Song {
    return {
        schemaVersion: row.schemaVersion,
        id: row.id,
        title: row.title,
        artist: row.artist,
        album: row.album,
        ...(row.imageUrl ? { imageUrl: row.imageUrl } : {}),
        key: row.key,
        tempo: row.tempo,
        compas: row.compas,
        body: row.body,
        ...(row.chart ? { chart: row.chart } : {}),
        ...(row.ownerId ? { ownerId: row.ownerId } : {}),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}

/** Repositorio sobre PostgreSQL. La conexión se abre al primer uso. */
export function createPostgresSongRepository(): SongRepository {
    return {
        async list() {
            // Solo se piden las columnas del listado: no se transfiere el cifrado ni el chart.
            const rows = await getDb()
                .select({
                    id: songs.id,
                    title: songs.title,
                    artist: songs.artist,
                    imageUrl: songs.imageUrl,
                    key: songs.key,
                    tempo: songs.tempo,
                    compas: songs.compas,
                    updatedAt: songs.updatedAt,
                    sectionCount: sql<number>`coalesce(jsonb_array_length(${songs.chart} -> 'sections'), 0)`,
                    chartStyle: sql<string | null>`${songs.chart} ->> 'style'`,
                })
                .from(songs)
                .orderBy(desc(songs.updatedAt));

            return rows.map<SongSummary>((r) => ({
                id: r.id,
                title: r.title,
                artist: r.artist,
                ...(r.imageUrl ? { imageUrl: r.imageUrl } : {}),
                key: r.key,
                tempo: r.tempo,
                compas: r.compas,
                updatedAt: r.updatedAt.toISOString(),
                hasChart: r.sectionCount > 0,
                ...(r.sectionCount > 0 && r.chartStyle ? { chartStyle: r.chartStyle as ChartStyle } : {}),
            }));
        },

        async get(id) {
            const [row] = await getDb().select().from(songs).where(eq(songs.id, id)).limit(1);
            return row ? toSong(row) : null;
        },

        async create(input, ownerId) {
            const [row] = await getDb()
                .insert(songs)
                .values({
                    ownerId: ownerId ?? null,
                    schemaVersion: SCHEMA_VERSION,
                    title: input.title,
                    artist: input.artist,
                    album: input.album,
                    imageUrl: input.imageUrl || null,
                    key: input.key,
                    tempo: input.tempo,
                    compas: input.compas,
                    body: input.body,
                    chart: input.chart ?? null,
                })
                .returning();
            if (!row) throw new Error('No se pudo crear la canción');
            return toSong(row);
        },

        async update(id, changes) {
            const { chart, imageUrl, ...fields } = changes;
            const values: Partial<NewSongRow> = { ...fields, updatedAt: new Date() };
            if (imageUrl !== undefined) values.imageUrl = imageUrl || null; // '' = quitar la imagen
            if (chart !== undefined) values.chart = chart; // null elimina el chart

            const [row] = await getDb().update(songs).set(values).where(eq(songs.id, id)).returning();
            return row ? toSong(row) : null;
        },

        async remove(id) {
            const rows = await getDb().delete(songs).where(eq(songs.id, id)).returning({ id: songs.id });
            return rows.length > 0;
        },
    };
}