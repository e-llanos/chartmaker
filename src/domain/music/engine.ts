/**
 * src/domain/music/engine.ts
 * Única capa que importa ChordSheetJS. Se usa para la matemática de
 * acordes: transposición y conversión americana / latina / Nashville / romano.
 *
 * Nota: en tonalidades menores ChordSheetJS numera respecto a la mayor
 * relativa (en Em, el acorde Em es "6m" y G es "1").
 */
import { Chord, Key } from 'chordsheetjs';
import { keyDistance } from '@/domain/music/core/key';

export type Notation = 'symbol' | 'latin' | 'nashville' | 'roman';

export const ALL_KEYS: string[] = [
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
    'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm',
];

/** `symbol` = americana (C D E). El orden define el orden del selector. */
export const NOTATION_LABELS: Record<Notation, string> = {
    symbol: 'Americano',
    latin: 'Latino',
    nashville: 'Nashville',
    roman: 'Romanos',
};

/* ---------- Americana <-> latina ---------- */

const AMERICAN_TO_LATIN: Record<string, string> = {
    C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si',
};
const LATIN_TO_AMERICAN: Record<string, string> = {
    Do: 'C', Re: 'D', Mi: 'E', Fa: 'F', Sol: 'G', La: 'A', Si: 'B',
};

const AMERICAN_NOTE = /^([A-G])([#b♯♭]?)/;
const LATIN_NOTE = /^(Do|Re|Mi|Fa|Sol|La|Si)([#b♯♭]?)/;

/** Cambia la nota raíz de `part` usando `re` y `map`; null si no coincide. */
function mapRoot(part: string, re: RegExp, map: Record<string, string>): string | null {
    const m = part.match(re);
    const name = m ? map[m[1] ?? ''] : undefined;
    if (!m || !name) return null;
    const accidental = (m[2] ?? '').replace('♯', '#').replace('♭', 'b');
    return name + accidental + part.slice(m[0].length);
}

function convertRoots(chord: string, re: RegExp, map: Record<string, string>): string {
    const [main = '', ...bass] = chord.split('/');
    const root = mapRoot(main.trim(), re, map);
    if (root === null) return chord;
    return [root, ...bass.map((b) => mapRoot(b.trim(), re, map) ?? b)].join('/');
}

/** "Mim7/Sol" -> "Em7/G". Si no parece latino, lo devuelve igual. */
export function latinToAmerican(chord: string): string {
    if (/^Fadd/.test(chord)) return chord; // americano, no "Fa" + "dd"
    return convertRoots(chord, LATIN_NOTE, LATIN_TO_AMERICAN);
}

/** "Em7/G" -> "Mim7/Sol". */
export function americanToLatin(chord: string): string {
    return convertRoots(chord, AMERICAN_NOTE, AMERICAN_TO_LATIN);
}

/* ---------- Utilidades internas ---------- */

/** Chord.parse devuelve null (o lanza) con texto no-acorde: "N.C.", "%"... */
function safeParseChord(str: string): Chord | null {
    try {
        return Chord.parse(String(str).trim()) || null;
    } catch {
        return null;
    }
}

function safeKey(key: string): Key | null {
    try {
        return Key.parse(key);
    } catch {
        return null;
    }
}

/** Si el acorde está en latín y resulta válido, lo pasa a americano. */
export function normalizeChord(chord: string): string {
    const american = latinToAmerican(chord);
    return american !== chord && safeParseChord(american) ? american : chord;
}

function formatByNotation(chord: Chord, notation: 'nashville' | 'roman', key: Key): string {
    return notation === 'nashville' ? chord.toNumericString(key) : chord.toNumeralString(key);
}

/* ---------- API pública ---------- */

/** Transpone un acorde (americano o latino). Siempre devuelve americano. */
export function transposeChordString(
    chordString: string,
    semitones: number,
    _notation?: Notation,
    originalKey?: string,
): string {
    if (!chordString) return chordString;
    const input = normalizeChord(chordString);
    if (!semitones) return input;
    const chord = safeParseChord(input);
    if (!chord) return chordString;
    const moved = chord.transpose(semitones);
    const key = originalKey ? safeKey(originalKey)?.transpose(semitones) : null;
    return key ? moved.toChordSymbolString(key) : moved.toString();
}

/** Convierte un acorde a la notación pedida respecto a `key`. */
export function convertChordString(chordString: string, notation: Notation, key: string): string {
    if (!chordString) return chordString;
    const normalized = normalizeChord(chordString);
    if (notation === 'symbol') return normalized;

    const chord = safeParseChord(normalized);
    if (!chord) return chordString;
    if (notation === 'latin') return americanToLatin(normalized);

    const ref = safeKey(key);
    return ref ? formatByNotation(chord, notation, ref) : chordString;
}

/** Texto de una tonalidad en la notación elegida: "Am" -> "Lam" en latina. */
export function formatKeyLabel(key: string, notation: Notation): string {
    if (notation !== 'latin') return key;
    const minor = key.endsWith('m');
    const latin = americanToLatin(minor ? key.slice(0, -1) : key);
    return minor ? `${latin}m` : latin;
}

/** Distancia en semitonos (-5..6) entre dos tonalidades, ignorando el modo. */
export function semitoneDistance(fromKey: string, toKey: string): number {
    return keyDistance(fromKey, toKey) ?? 0;
}

/** Acordes diatónicos de la tonalidad, para la paleta rápida del editor. */
export function diatonicChords(key: string): string[] {
    const minor = key.endsWith('m');
    const root = key.replace(/m$/, '');
    const degrees: Array<[number, string]> = minor
        ? [[0, 'm'], [2, 'dim'], [3, ''], [5, 'm'], [7, 'm'], [8, ''], [10, '']]
        : [[0, ''], [2, 'm'], [4, 'm'], [5, ''], [7, ''], [9, 'm']];
    const base = safeParseChord(root);
    if (!base) return [];
    return degrees.map(([n, q]) => base.transpose(n).toString() + q);
}