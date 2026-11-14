import { z } from 'zod';
import { tidyChart } from '@/domain/chart/utils';
import { isSongKey, normalizeSongKey } from '@/domain/music/core/key';
import { parseTimeSignature } from '@/domain/music/core/meter';
import { DEFAULT_SONG_INPUT, TEMPO_MAX, TEMPO_MIN } from '@/domain/song/constants';
import { SONG_LIMITS } from '@/domain/song/limits';
import type { SongCreate, SongUpdate } from '@/domain/song/types';
import { chartSchema } from './chart';
import { describeIssue } from './issues';
import type { Result } from './result';

const text = (field: keyof typeof SONG_LIMITS) =>
    z.string().max(SONG_LIMITS[field], `"${field}" es demasiado largo (máximo ${SONG_LIMITS[field]} caracteres)`);

const tempoMessage = `"tempo" debe ser un entero entre ${TEMPO_MIN} y ${TEMPO_MAX}`;

/** Los datos editables de una canción. */
export const songInputSchema = z.object({
    title: text('title').refine((s) => s.trim() !== '', 'El título no puede estar vacío'),
    artist: text('artist'),
    album: text('album'),
    // '' = quitar la imagen; si no, http(s):// o una ruta local con un solo "/" ("//dominio" es externo).
    imageUrl: z
        .string()
        .trim()
        .refine((u) => u === '' || /^(https?:\/\/|\/(?!\/))/i.test(u), '"imageUrl" debe empezar por http(s):// o /')
        .optional(),
    // Una tonalidad teórica (D#, G#…) se guarda como su equivalente práctica (Eb, Ab…).
    key: text('key')
        .transform((v) => normalizeSongKey(v)?.key ?? v)
        .refine(isSongKey, '"key" no es una tonalidad válida (ej. G, F#, Am)'),
    tempo: z.number().int(tempoMessage).min(TEMPO_MIN, tempoMessage).max(TEMPO_MAX, tempoMessage),
    compas: text('compas').refine((v) => parseTimeSignature(v) !== null, '"compas" debe tener formato 4/4, 6/8…'),
    body: text('body'),
});

/** Cambios parciales: solo se validan los campos presentes. `chart: null` elimina el chart. */
export const songUpdateSchema = songInputSchema.partial().extend({
    chart: chartSchema.nullable().optional(),
});

/** Valida un objeto parcial: solo se incluyen los campos presentes. */
export function parseSongUpdate(data: unknown): Result<SongUpdate> {
    if (!data || typeof data !== 'object') return { ok: false, error: 'JSON inválido' };

    const parsed = songUpdateSchema.safeParse(data);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return { ok: false, error: issue ? describeIssue(issue, issue.path[0] === 'chart') : 'JSON inválido' };
    }

    const { chart } = parsed.data;
    return { ok: true, value: { ...parsed.data, ...(chart ? { chart: tidyChart(chart) } : {}) } };
}

/** Valida una canción nueva: completa los campos que falten con valores por defecto. */
export function parseSongInput(data: unknown): Result<SongCreate> {
    const parsed = parseSongUpdate(data);
    if (!parsed.ok) return parsed;
    const { chart, ...rest } = parsed.value;
    const value: SongCreate = {
        ...DEFAULT_SONG_INPUT,
        ...rest,
        ...(chart ? { chart } : {}),
    };
    if (!value.title.trim()) return { ok: false, error: 'El título es obligatorio' };
    return { ok: true, value };
}