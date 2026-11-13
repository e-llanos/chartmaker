import type { Chart, ChartStyle } from '@/domain/chart/types';

export interface Song {
    /** Versión del formato de los datos guardados (ver domain/song/migrate.ts). */
    schemaVersion: number;
    id: string;
    title: string;
    artist: string;
    album: string;
    imageUrl?: string;
    key: string;
    tempo: number;
    compas: string;
    body: string;
    chart?: Chart;
    createdAt: string;
    updatedAt: string;
}

/** Datos que aporta el usuario al crear una canción. */
export type SongInput = Pick<Song, 'title' | 'artist' | 'album' | 'imageUrl' | 'key' | 'tempo' | 'compas' | 'body'>;

/** Canción nueva: los datos editables más un chart opcional (importación). */
export type SongCreate = SongInput & { chart?: Chart };

/** Cambios parciales. `chart: null` elimina el chart. */
export type SongUpdate = Partial<SongInput> & { chart?: Chart | null };

export type SongSummary = Pick<
    Song,
    'id' | 'title' | 'artist' | 'imageUrl' | 'key' | 'tempo' | 'compas' | 'updatedAt'
> & { hasChart: boolean; chartStyle?: ChartStyle };