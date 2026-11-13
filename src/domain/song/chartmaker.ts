import { mergeLegacyChart } from '@/domain/song/migrate';
import type { SongCreate } from '@/domain/song/types';
import { parseSongInput, type Result } from '@/domain/song/validation';

export const CHARTMAKER_EXT = '.chartmaker';
export const CHARTMAKER_MAX_BYTES = 2 * 1024 * 1024;

const FORMAT = 'chartmaker';
/** 2: un solo chart con estilo. La 1 guardaba chart y chart avanzado por separado. */
const VERSION = 2;

export interface ChartmakerFile {
    format: typeof FORMAT;
    version: number;
    exportedAt: string;
    song: SongCreate;
}

/** Lleva el contenido de un archivo de una versión anterior a la actual. */
function upgrade(song: unknown, version: number): unknown {
    if (version >= 2 || typeof song !== 'object' || song === null) return song;
    const { chart, score, ...rest } = song as Record<string, unknown>;
    const merged = mergeLegacyChart(chart, score);
    return merged.chart ? { ...rest, chart: merged.chart } : rest;
}

/** Lee y valida el contenido de un archivo .chartmaker. */
export function parseChartmaker(text: string): Result<SongCreate> {
    let data: unknown;
    try {
        data = JSON.parse(text.replace(/^\uFEFF/, ''));
    } catch {
        return { ok: false, error: 'El archivo no es un .chartmaker válido' };
    }
    if (!data || typeof data !== 'object') {
        return { ok: false, error: 'El archivo no es un .chartmaker válido' };
    }

    const file = data as Partial<ChartmakerFile>;
    if (file.format !== FORMAT) {
        return { ok: false, error: 'El archivo no es un .chartmaker válido' };
    }
    if (typeof file.version !== 'number' || !Number.isInteger(file.version) || file.version < 1) {
        return { ok: false, error: 'El archivo no es un .chartmaker válido' };
    }
    if (file.version > VERSION) {
        return { ok: false, error: 'El archivo fue creado con una versión más nueva de la app' };
    }
    return parseSongInput(upgrade(file.song, file.version));
}

export function serializeChartmaker(song: SongCreate): string {
    const { title, artist, album, imageUrl, key, tempo, compas, body, chart } = song;
    const file: ChartmakerFile = {
        format: FORMAT,
        version: VERSION,
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