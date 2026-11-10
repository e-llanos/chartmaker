/**
 * Intervalos y grados. Un grado es un texto relativo a la escala mayor de la tónica:
 * "1", "b3", "#4", "bb7", "9", "#11"… De él salen los semitonos, el nombre y la ortografía.
 */
import { mod, noteName, type Note } from './pitch';

const MAJOR_SEMIS = [0, 2, 4, 5, 7, 9, 11] as const;

/** "b3" -> { degree: 3, alt: -1 }; "#4" -> { degree: 4, alt: 1 }; "9" -> { degree: 9, alt: 0 }. */
export function parseDegree(token: string): { degree: number; alt: number } | null {
    const m = token.match(/^(#{0,2}|b{0,2})(\d{1,2})$/);
    if (!m) return null;
    const acc = m[1] ?? '';
    const alt = acc ? (acc.startsWith('#') ? 1 : -1) * acc.length : 0;
    return { degree: Number(m[2]), alt };
}

/** Semitonos de un grado sobre la tónica: "b3" -> 3, "5" -> 7, "9" -> 14, "#11" -> 18. */
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

const INTERVAL_NAMES: Record<string, string> = {
    '1': 'Tónica', '#1': '1.ª aumentada',
    b2: '2.ª menor', '2': '2.ª mayor', '#2': '2.ª aumentada',
    bb3: '3.ª doblemente disminuida', b3: '3.ª menor', '3': '3.ª mayor',
    b4: '4.ª disminuida', '4': '4.ª justa', '#4': '4.ª aumentada',
    b5: '5.ª disminuida', '5': '5.ª justa', '#5': '5.ª aumentada',
    b6: '6.ª menor', '6': '6.ª mayor', '#6': '6.ª aumentada',
    bb7: '7.ª disminuida', b7: '7.ª menor', '7': '7.ª mayor',
    b9: '9.ª menor', '9': '9.ª mayor', '#9': '9.ª aumentada',
    '11': '11.ª justa', '#11': '11.ª aumentada',
    b13: '13.ª menor', '13': '13.ª mayor',
};

/** Nombre del intervalo de un grado; si no lo conoce, devuelve el propio grado. */
export const intervalName = (token: string): string => INTERVAL_NAMES[token] ?? token;
