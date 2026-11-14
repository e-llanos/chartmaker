import { mergeLegacyChart } from '@/domain/song/migrate';
import type { SongCreate } from '@/domain/song/types';

export const CHARTMAKER_EXT = '.chartmaker';
export const CHARTMAKER_MAX_BYTES = 2 * 1024 * 1024;

export const CHARTMAKER_FORMAT = 'chartmaker';
/** 2: un solo chart con estilo. La 1 guardaba chart y chart avanzado por separado. */
export const CHARTMAKER_VERSION = 2;

export interface ChartmakerFile {
    format: typeof CHARTMAKER_FORMAT;
    version: number;
    exportedAt: string;
    song: SongCreate;
}

/** Lleva el contenido de un archivo de una versión anterior a la actual. */
export function upgradeChartmakerSong(song: unknown, version: number): unknown {
    if (version >= 2 || typeof song !== 'object' || song === null) return song;
    const { chart, score, ...rest } = song as Record<string, unknown>;
    const merged = mergeLegacyChart(chart, score);
    return merged.chart ? { ...rest, chart: merged.chart } : rest;
}

export function serializeChartmaker(song: SongCreate): string {
    const { title, artist, album, imageUrl, key, tempo, compas, body, chart } = song;
    const file: ChartmakerFile = {
        format: CHARTMAKER_FORMAT,
        version: CHARTMAKER_VERSION,
        exportedAt: new Date().toISOString(),
        song: {
            title, artist, album,
            ...(imageUrl ? { imageUrl } : {}),
            key, tempo, compas, body,
            ...(chart ? { chart } : {}),
        },
    };
    return JSON.stringify(file, null, 2);
}