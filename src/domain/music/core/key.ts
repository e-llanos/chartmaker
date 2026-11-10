/**
 * Tonalidades y armaduras.
 *
 * Dos listas, con propósitos distintos, ambas derivadas de la armadura (nada escrito a mano):
 *  - THEORY_ROOTS: 21 raíces (7 letras × natural, # y b). Para la sección de teoría, que es permisiva.
 *  - SONG_KEYS: 30 tonalidades prácticas (armadura de 7 alteraciones como máximo). Para canciones.
 */
import { accidentalsOf, mod, parseNote, pitchClassOf, LETTERS } from './pitch';
import { spell } from './interval';

export type KeyMode = 'major' | 'minor';

export interface Key {
    /** Nota tónica con su alteración: "Eb", "F#". */
    tonic: string;
    mode: KeyMode;
}

/** Fórmulas de las escalas que definen cada modo de la tonalidad. */
export const MAJOR_FORMULA = ['1', '2', '3', '4', '5', '6', '7'] as const;
export const NATURAL_MINOR_FORMULA = ['1', '2', 'b3', '4', '5', 'b6', 'b7'] as const;

/** Máximo de alteraciones de la armadura de una tonalidad práctica. */
export const MAX_PRACTICAL_ACCIDENTALS = 7;

/** "Am" -> { tonic: "A", mode: "minor" }; "F#" -> { tonic: "F#", mode: "major" }. */
export function parseKey(text: string): Key | null {
    const m = text.trim().replace(/♯/g, '#').replace(/♭/g, 'b').match(/^([A-G](?:#{1,2}|b{1,2})?)(m)?$/);
    if (!m) return null;
    return { tonic: m[1] ?? '', mode: m[2] ? 'minor' : 'major' };
}

export const formatKey = (key: Key): string => key.tonic + (key.mode === 'minor' ? 'm' : '');

/**
 * Alteraciones de la armadura: positivo = sostenidos, negativo = bemoles.
 * Una doble alteración cuenta 2: D# mayor = 9; Eb mayor = -3.
 */
export function keyAccidentals(key: Key): number | null {
    const tonic = parseNote(key.tonic);
    if (!tonic) return null;
    const formula = key.mode === 'major' ? MAJOR_FORMULA : NATURAL_MINOR_FORMULA;
    return formula.reduce((sum, token) => sum + accidentalsOf(spell(tonic, token).name), 0);
}

const SHARP_ORDER = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'];
const FLAT_ORDER = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'];

/** Notas alteradas de una armadura: 2 -> [F#, C#]; -3 -> [Bb, Eb, Ab]. */
export function keySignatureNotes(accidentals: number): string[] {
    return accidentals >= 0 ? SHARP_ORDER.slice(0, accidentals) : FLAT_ORDER.slice(0, -accidentals);
}

/** ¿Se usa en la práctica? (armadura de 7 alteraciones como máximo). */
export function isPracticalKey(key: Key): boolean {
    const n = keyAccidentals(key);
    return n !== null && Math.abs(n) <= MAX_PRACTICAL_ACCIDENTALS;
}

/** Las 21 raíces de la teoría, de Cb a B#, en el orden del selector. */
export const THEORY_ROOTS: readonly string[] = LETTERS.flatMap((l) => [`${l}b`, l, `${l}#`]);

/** Las 30 tonalidades prácticas: primero las 15 mayores, luego las 15 menores. */
export const SONG_KEYS: readonly string[] = (['major', 'minor'] as const).flatMap((mode) =>
    THEORY_ROOTS.map((tonic): Key => ({ tonic, mode })).filter(isPracticalKey).map(formatKey),
);

export const isSongKey = (text: string): boolean => SONG_KEYS.includes(text);

/** Otras escrituras de la misma tonalidad (mismo sonido y modo), de menos a más alteraciones. */
export function enharmonicKeys(key: Key): Key[] {
    const pc = pitchClassOf(key.tonic);
    if (pc === null) return [];
    const size = (k: Key) => Math.abs(keyAccidentals(k) ?? Number.POSITIVE_INFINITY);
    return THEORY_ROOTS.filter((r) => r !== key.tonic && pitchClassOf(r) === pc)
        .map((tonic): Key => ({ tonic, mode: key.mode }))
        .sort((a, b) => size(a) - size(b));
}

export interface NormalizedKey {
    /** Tonalidad práctica ("Eb"); es la misma si ya lo era. */
    key: string;
    /** true si la entrada era teórica y se sustituyó por su equivalente. */
    changed: boolean;
}

/** Lleva una tonalidad de canción a su forma práctica: "D#" -> Eb (changed), "Eb" -> Eb. Null si no es válida. */
export function normalizeSongKey(text: string): NormalizedKey | null {
    const key = parseKey(text);
    if (!key) return null;
    if (isPracticalKey(key)) return { key: formatKey(key), changed: false };
    const equivalent = enharmonicKeys(key).find(isPracticalKey);
    return equivalent ? { key: formatKey(equivalent), changed: true } : null;
}

/** Relativa: Em <-> G, C <-> Am. */
export function relativeKey(key: Key): Key | null {
    const tonic = parseNote(key.tonic);
    if (!tonic) return null;
    return key.mode === 'minor'
        ? { tonic: spell(tonic, 'b3').name, mode: 'major' }
        : { tonic: spell(tonic, '6').name, mode: 'minor' };
}

/** Distancia en semitonos (-5..6) entre dos tonalidades, ignorando el modo. Null si alguna no es válida. */
export function keyDistance(fromKey: string, toKey: string): number | null {
    const from = parseKey(fromKey);
    const to = parseKey(toKey);
    const a = from ? pitchClassOf(from.tonic) : null;
    const b = to ? pitchClassOf(to.tonic) : null;
    if (a === null || b === null) return null;
    return mod(b - a + 17, 12) - 5;
}
