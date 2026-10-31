import type { SongInput } from '@/domain/song/types';
import { parseSongInput, type Result } from '@/domain/song/validation';
import type { SongCreate } from '@/domain/song/types';

export const CHARTMAKER_EXT = '.chartmaker';
export const CHARTMAKER_MAX_BYTES = 2 * 1024 * 1024;

const FORMAT = 'chartmaker';
const VERSION = 1;

export interface ChartmakerFile {
    format: typeof FORMAT;
    version: number;
    exportedAt: string;
    song: SongCreate;
}

/** Lee y valida el contenido de un archivo .chartmaker. */
export function parseChartmaker(text: string): Result<SongInput> {
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
    if (typeof file.version !== 'number' || file.version > VERSION) {
        return { ok: false, error: 'El archivo fue creado con una versión más nueva de la app' };
    }
    return parseSongInput(file.song);
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