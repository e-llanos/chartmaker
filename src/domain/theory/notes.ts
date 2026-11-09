/** Notas, intervalos y ortografía. TypeScript puro: sin React, Next ni Node. */

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
const MAJOR_SEMIS = [0, 2, 4, 5, 7, 9, 11];
const LATIN = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

/** Tónicas disponibles: las mismas tonalidades que usa la app. */
export const THEORY_ROOTS = [
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
] as const;

export type NameStyle = 'symbol' | 'latin';

export const mod = (n: number, m: number): number => ((n % m) + m) % m;

export interface Note {
    /** Índice de la letra: C=0 … B=6. */
    letter: number;
    /** Altura sin octava: 0 a 11. */
    pc: number;
}

/** "Eb" -> { letter: 2, pc: 3 }. Admite ## y bb. */
export function parseNote(name: string): Note | null {
    const m = name.match(/^([A-G])(#{1,2}|b{1,2})?$/);
    if (!m) return null;
    const letter = LETTERS.indexOf(m[1] as (typeof LETTERS)[number]);
    const acc = m[2] ? (m[2].startsWith('#') ? 1 : -1) * m[2].length : 0;
    return { letter, pc: mod((LETTER_PC[letter] ?? 0) + acc, 12) };
}

/** Nombre de la nota con esa letra y esa altura: (2, 3) -> "Eb". */
export function noteName(letter: number, pc: number): string {
    const l = mod(letter, 7);
    const diff = mod(pc - (LETTER_PC[l] ?? 0) + 6, 12) - 6;
    const base = LETTERS[l] ?? 'C';
    return diff === 0 ? base : base + (diff > 0 ? '#' : 'b').repeat(Math.abs(diff));
}

/** "b3" -> { degree: 3, alt: -1 }; "#4" -> { degree: 4, alt: 1 }; "9" -> { degree: 9, alt: 0 }. */
export function parseDegree(token: string): { degree: number; alt: number } | null {
    const m = token.match(/^(#{0,2}|b{0,2})(\d{1,2})$/);
    if (!m) return null;
    const acc = m[1] ?? '';
    const alt = acc ? (acc.startsWith('#') ? 1 : -1) * acc.length : 0;
    return { degree: Number(m[2]), alt };
}

/** Semitonos de un grado sobre la tónica: "b3" -> 3, "5" -> 7, "9" -> 14. */
export function degreeSemitones(token: string): number {
    const iv = parseDegree(token);
    if (!iv) return 0;
    const i = iv.degree - 1;
    return (MAJOR_SEMIS[i % 7] ?? 0) + 12 * Math.floor(i / 7) + iv.alt;
}

export interface SpelledNote {
    name: string;
    pc: number;
    /** Semitonos desde la tónica. */
    semis: number;
    /** Grado de la fórmula: "1", "b3"… */
    degree: string;
}

/** Escribe la nota que queda a `token` de la tónica, usando una letra distinta por grado. */
export function spell(root: Note, token: string): SpelledNote {
    const iv = parseDegree(token);
    const semis = degreeSemitones(token);
    const pc = mod(root.pc + semis, 12);
    const letter = mod(root.letter + (iv ? iv.degree - 1 : 0), 7);
    return { name: noteName(letter, pc), pc, semis, degree: token };
}

/** "F#" -> "Fa#" en notación latina. */
export function formatNote(name: string, style: NameStyle): string {
    if (style === 'symbol') return name;
    const letter = LETTERS.findIndex((l) => l === name[0]);
    return letter < 0 ? name : `${LATIN[letter] ?? ''}${name.slice(1)}`;
}

/** "Bbm7b5" -> "Sibm7b5" en notación latina (solo cambia la nota raíz). */
export function formatChordSymbol(symbol: string, style: NameStyle): string {
    if (style === 'symbol') return symbol;
    const m = symbol.match(/^([A-G](?:#{1,2}|b{1,2})?)(.*)$/);
    return m ? formatNote(m[1] ?? '', style) + (m[2] ?? '') : symbol;
}

const INTERVAL_NAMES: Record<string, string> = {
    '1': 'Tónica', b2: '2.ª menor', '2': '2.ª mayor', '#2': '2.ª aumentada',
    b3: '3.ª menor', '3': '3.ª mayor', '4': '4.ª justa', '#4': '4.ª aumentada',
    b5: '5.ª disminuida', '5': '5.ª justa', '#5': '5.ª aumentada',
    b6: '6.ª menor', '6': '6.ª mayor', bb7: '7.ª disminuida', b7: '7.ª menor', '7': '7.ª mayor',
    b9: '9.ª menor', '9': '9.ª mayor',
};

export const intervalName = (token: string): string => INTERVAL_NAMES[token] ?? token;