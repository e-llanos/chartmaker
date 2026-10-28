export type SongView = 'cifrado' | 'chart' | 'advanced';

export const SONG_VIEWS: readonly SongView[] = ['cifrado', 'chart', 'advanced'];

/** Lee `?view=` con tolerancia: cualquier valor desconocido es el cifrado. */
export function parseView(value: unknown): SongView {
    const v = Array.isArray(value) ? value[0] : value;
    return v === 'chart' || v === 'advanced' ? v : 'cifrado';
}

export const songPath = (id: string, view: SongView): string =>
    view === 'cifrado' ? `/songs/${id}` : `/songs/${id}?view=${view}`;

export const songEditPath = (id: string, view: SongView): string =>
    view === 'cifrado' ? `/songs/${id}/edit` : `/songs/${id}/${view}/edit`;