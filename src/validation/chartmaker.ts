import {
    CHARTMAKER_FORMAT,
    CHARTMAKER_VERSION,
    upgradeChartmakerSong,
    type ChartmakerFile,
} from '@/domain/song/chartmaker';
import type { SongCreate } from '@/domain/song/types';
import type { Result } from './result';
import { parseSongInput } from './song';

const INVALID = 'El archivo no es un .chartmaker válido';

/** Lee y valida el contenido de un archivo .chartmaker (de la versión actual o de una anterior). */
export function parseChartmaker(text: string): Result<SongCreate> {
    let data: unknown;
    try {
        data = JSON.parse(text.replace(/^\uFEFF/, ''));
    } catch {
        return { ok: false, error: INVALID };
    }
    if (!data || typeof data !== 'object') return { ok: false, error: INVALID };

    const file = data as Partial<ChartmakerFile>;
    if (file.format !== CHARTMAKER_FORMAT) return { ok: false, error: INVALID };
    if (typeof file.version !== 'number' || !Number.isInteger(file.version) || file.version < 1) {
        return { ok: false, error: INVALID };
    }
    if (file.version > CHARTMAKER_VERSION) {
        return { ok: false, error: 'El archivo fue creado con una versión más nueva de la app' };
    }
    return parseSongInput(upgradeChartmakerSong(file.song, file.version));
}