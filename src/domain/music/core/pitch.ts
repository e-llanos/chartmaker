/**
 * Alturas y ortografía de las notas.
 * Capa `core`: TypeScript puro, sin React, Next, Node ni librerías.
 */

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

/** Altura (0–11) de cada letra natural. */
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11] as const;

export const mod = (n: number, m: number): number => ((n % m) + m) % m;

export interface Note {
    /** Índice de la letra: C=0 … B=6. */
    letter: number;
    /** Altura sin octava: 0 a 11. */
    pc: number;
}

/** "Eb" -> { letter: 2, pc: 3 }. Admite hasta tres alteraciones (###, bbb). */
export function parseNote(name: string): Note | null {
    const m = name.match(/^([A-G])(#{1,3}|b{1,3})?$/);
    if (!m) return null;
    const letter = LETTERS.indexOf(m[1] as (typeof LETTERS)[number]);
    return { letter, pc: mod((LETTER_PC[letter] ?? 0) + accidentalsOf(m[2] ?? ''), 12) };
}

/** Nombre de la nota con esa letra y esa altura: (2, 3) -> "Eb". */
export function noteName(letter: number, pc: number): string {
    const l = mod(letter, 7);
    const diff = mod(pc - (LETTER_PC[l] ?? 0) + 6, 12) - 6;
    const base = LETTERS[l] ?? 'C';
    return diff === 0 ? base : base + (diff > 0 ? '#' : 'b').repeat(Math.abs(diff));
}

/** Alteración de un nombre: "F##" -> 2, "Bb" -> -1, "C" -> 0. Ignora la letra. */
export function accidentalsOf(name: string): number {
    const acc = name.replace(/^[A-G]/, '');
    if (!acc) return 0;
    return (acc.startsWith('#') ? 1 : -1) * acc.length;
}

/** Altura (0–11) de un nombre de nota, o null si no es una nota válida. */
export const pitchClassOf = (name: string): number | null => parseNote(name)?.pc ?? null;

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

/** Nombre de una altura (0–11) escrito con sostenidos o con bemoles. */
export const pitchName = (pc: number, preferFlats: boolean): string =>
    (preferFlats ? FLAT_NAMES : SHARP_NAMES)[mod(pc, 12)] ?? '';
