/**
 * Formatos (vistas) de una canción. El orden es el de las pestañas y el primero es el principal.
 * Para añadir un formato: agrégalo aquí y registra su definición en features/songs/formats.tsx.
 */
export const SONG_VIEWS = ['cifrado', 'chart'] as const;

export type SongView = (typeof SONG_VIEWS)[number];

/** Formato principal: su ruta no lleva sufijo (/songs/:id y /songs/:id/edit). */
export const DEFAULT_VIEW: SongView = 'cifrado';

export const isSongView = (value: unknown): value is SongView =>
    typeof value === 'string' && (SONG_VIEWS as readonly string[]).includes(value);

/** Vistas que ya no existen y a cuál equivalen: las URLs antiguas siguen funcionando. */
const LEGACY_VIEWS: Record<string, SongView> = { advanced: 'chart' };

/** Lee `?view=` con tolerancia: cualquier valor desconocido es el formato principal. */
export function parseView(value: unknown): SongView {
    const v = Array.isArray(value) ? value[0] : value;
    if (isSongView(v)) return v;
    return (typeof v === 'string' && LEGACY_VIEWS[v]) || DEFAULT_VIEW;
}

export const songPath = (id: string, view: SongView): string =>
    view === DEFAULT_VIEW ? `/songs/${id}` : `/songs/${id}?view=${view}`;

export const songEditPath = (id: string, view: SongView): string =>
    view === DEFAULT_VIEW ? `/songs/${id}/edit` : `/songs/${id}/${view}/edit`;


export const LOGIN_PATH = '/login';

export const loginPath = (next?: string): string =>
    next ? `${LOGIN_PATH}?next=${encodeURIComponent(next)}` : LOGIN_PATH;

/** Solo rutas internas: evita que el login redirija a otro sitio. */
export function safeNext(value: unknown, fallback = '/songs'): string {
    return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
        ? value
        : fallback;
}