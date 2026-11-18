import type { ChartStyle } from '@/domain/chart/types';

export const SONG_SORTS = ['relevance', 'created', 'recent', 'title', 'artist', 'key', 'tempo'] as const;
export type SongSort = (typeof SONG_SORTS)[number];
export type SortDir = 'asc' | 'desc';

export const SORT_LABELS: Record<SongSort, string> = {
    relevance: 'Relevancia',
    created: 'Añadidas',
    recent: 'Modificadas',
    title: 'Título',
    artist: 'Artista',
    key: 'Tonalidad',
    tempo: 'Tempo',
};

export const CATALOG_TABS = ['all', 'songs', 'artists', 'albums'] as const;
export type CatalogTab = (typeof CATALOG_TABS)[number];
export const CATALOG_TAB_LABELS: Record<CatalogTab, string> = {
    all: 'Todos',
    songs: 'Canciones',
    artists: 'Artistas',
    albums: 'Álbumes',
};

export const LIBRARY_VIEWS = ['all', 'saved'] as const;
export type LibraryView = (typeof LIBRARY_VIEWS)[number];

export const PAGE_SIZE = 20;

export interface SongQuery {
    q: string;
    sort: SongSort;
    dir: SortDir;
    page: number;
    /** Id del artista. */
    artist: string;
    /** Id del álbum. */
    album: string;
    key: string;
    withChart: boolean;
    tab: CatalogTab;
    view: LibraryView;
}

/** Orden por defecto de cada pantalla (no se escribe en la URL). */
export interface SortDefaults {
    sort: SongSort;
}

const DEFAULT_DIRECTION: Record<SongSort, SortDir> = {
    relevance: 'desc',
    created: 'desc',
    recent: 'desc',
    title: 'asc',
    artist: 'asc',
    key: 'asc',
    tempo: 'asc',
};

/** Con búsqueda, lo más relevante primero; sin ella, el orden de cada pantalla. */
const defaultSortFor = (q: string, defaults: SortDefaults): SongSort => (q ? 'relevance' : defaults.sort);

export type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined): string => (Array.isArray(value) ? value[0] : value) ?? '';

const oneOf = <T extends string>(list: readonly T[], value: string, fallback: T): T =>
    (list as readonly string[]).includes(value) ? (value as T) : fallback;

/** Lee la URL con tolerancia: cualquier valor raro vuelve al valor por defecto. */
export function parseSongQuery(raw: RawParams, defaults: SortDefaults): SongQuery {
    const q = first(raw.q).trim().slice(0, 100);
    const asked = oneOf(SONG_SORTS, first(raw.sort), defaultSortFor(q, defaults));
    // Sin búsqueda no hay relevancia que ordenar.
    const sort = asked === 'relevance' && !q ? defaults.sort : asked;
    const page = Number.parseInt(first(raw.page), 10);
    return {
        q,
        sort,
        dir: oneOf(['asc', 'desc'] as const, first(raw.dir), DEFAULT_DIRECTION[sort]),
        page: Number.isInteger(page) && page > 0 ? Math.min(page, 10_000) : 1,
        artist: first(raw.artist).slice(0, 64),
        album: first(raw.album).slice(0, 64),
        key: first(raw.key).slice(0, 4),
        withChart: first(raw.chart) === '1',
        tab: oneOf(CATALOG_TABS, first(raw.tab), 'all'),
        view: oneOf(LIBRARY_VIEWS, first(raw.view), 'all'),
    };
}

/** Parámetros de la URL para la consulta actual más los cambios pedidos; omite los valores por defecto. */
export function songsParams(current: SongQuery, patch: Partial<SongQuery>, defaults: SortDefaults): URLSearchParams {
    const next = { ...current, ...patch };
    // Cambiar cualquier filtro vuelve a la primera página, salvo que se pida una concreta.
    if (patch.page === undefined) next.page = 1;
    // Sin búsqueda no hay relevancia; y cambiar el criterio recupera su sentido natural.
    if (next.sort === 'relevance' && !next.q) next.sort = defaults.sort;
    if (patch.sort !== undefined && patch.dir === undefined) next.dir = DEFAULT_DIRECTION[next.sort];

    const params = new URLSearchParams();
    if (next.q) params.set('q', next.q);
    if (next.tab !== 'all') params.set('tab', next.tab);
    if (next.view !== 'all') params.set('view', next.view);
    if (next.artist) params.set('artist', next.artist);
    if (next.album) params.set('album', next.album);
    if (next.key) params.set('key', next.key);
    if (next.withChart) params.set('chart', '1');
    if (next.sort !== defaultSortFor(next.q, defaults)) params.set('sort', next.sort);
    if (next.dir !== DEFAULT_DIRECTION[next.sort]) params.set('dir', next.dir);
    if (next.page > 1) params.set('page', String(next.page));
    return params;
}

export function songsHref(current: SongQuery, patch: Partial<SongQuery>, defaults: SortDefaults): string {
    const qs = songsParams(current, patch, defaults).toString();
    return qs ? `/songs?${qs}` : '/songs';
}

export function directionLabel(sort: SongSort, dir: SortDir): string {
    if (sort === 'relevance') return dir === 'desc' ? 'Más relevantes' : 'Menos relevantes';
    if (sort === 'created' || sort === 'recent') return dir === 'desc' ? 'Más recientes' : 'Más antiguas';
    if (sort === 'tempo') return dir === 'asc' ? 'Menor a mayor' : 'Mayor a menor';
    return dir === 'asc' ? 'A–Z' : 'Z–A';
}

/* ---------- Lo que devuelven las búsquedas ---------- */

export interface SongListItem {
    id: string;
    title: string;
    artist: string;
    album: string;
    artistId?: string;
    albumId?: string;
    imageUrl?: string;
    key: string;
    tempo: number;
    compas: string;
    createdAt: string;
    updatedAt: string;
    hasChart: boolean;
    chartStyle?: ChartStyle;
    /** ¿La guardó el usuario que consulta? (siempre falso sin sesión). */
    isFavorite: boolean;
}

export interface SongPage {
    items: SongListItem[];
    total: number;
    page: number;
    pageCount: number;
}

export interface ArtistSummary {
    id: string;
    name: string;
    imageUrl?: string;
    songs: number;
}

export interface AlbumSummary {
    id: string;
    title: string;
    artistName?: string;
    /** Portada del álbum, o la de una de sus canciones. */
    imageUrl?: string;
    songs: number;
}

/** Canciones de un artista o de un álbum. */
export const artistHref = (artistId: string): string => `/songs?artist=${encodeURIComponent(artistId)}`;
export const albumHref = (albumId: string): string => `/songs?album=${encodeURIComponent(albumId)}`;