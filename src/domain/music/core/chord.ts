/**
 * Acorde como dato: raíz + sufijo (tal como lo escribió el usuario) + bajo opcional.
 *
 * Regla: se acepta cualquier alias al escribir, se GUARDA lo tecleado y solo se normaliza
 * para analizar. Por eso `suffix` conserva el texto original ("Δ", "-7") y `quality` es el
 * id canónico que se usa para entender qué acorde es.
 */

import { qualityBySuffix } from './chord-quality';

const NOTE = '[A-G](?:#{1,3}|b{1,3})?';
/** "6/9" lleva barra pero no es un bajo: se reconoce antes de separar el bajo. */
const CHORD = new RegExp(`^(${NOTE})((?:6\\/9|[^/])*)(?:\\/(${NOTE}))?$`);

export interface Chord {
    /** Raíz: "D#", "Bb". */
    root: string;
    /** Lo que sigue a la raíz, tal cual se escribió. "" = mayor. */
    suffix: string;
    /** Bajo alterno: en "C/E" es "E". */
    bass?: string;
    /** Id canónico del tipo de acorde ("m7b5"), o null si no se reconoce. */
    quality: string | null;
}

/** Id canónico del sufijo de un acorde ("Δ7" -> "maj7"), o null si no se reconoce. */
export const qualityOf = (suffix: string): string | null => qualityBySuffix(suffix)?.id ?? null;

/** "Dm7/G" -> { root: "D", suffix: "m7", bass: "G", quality: "m7" }. Null si no es un acorde ("N.C.", "%"). */
export function parseChord(text: string): Chord | null {
    const m = text.trim().match(CHORD);
    if (!m) return null;
    const suffix = m[2] ?? '';
    return { root: m[1] ?? '', suffix, ...(m[3] ? { bass: m[3] } : {}), quality: qualityOf(suffix) };
}

/** Vuelve al texto: es exactamente lo que se parseó. */
export const formatChord = (chord: Chord): string =>
    `${chord.root}${chord.suffix}${chord.bass ? `/${chord.bass}` : ''}`;
