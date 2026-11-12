/**
 * Notación americana (C D E) y latina (Do Re Mi): ÚNICO lugar donde se convierten los nombres.
 * Solo se cambia la raíz y el bajo; el sufijo se conserva tal como se escribió.
 */
import { parseChord } from './chord';
import { LETTERS } from './pitch';

export type NameStyle = 'symbol' | 'latin';

export const LATIN_NAMES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'] as const;

const AMERICAN_TO_LATIN: Record<string, string> = Object.fromEntries(
    LETTERS.map((l, i) => [l, LATIN_NAMES[i] ?? '']),
);
const LATIN_TO_AMERICAN: Record<string, string> = Object.fromEntries(
    LATIN_NAMES.map((n, i) => [n, LETTERS[i] ?? '']),
);

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

/** Si el acorde está en latín y resulta válido, lo pasa a americano. */
export function normalizeChord(chord: string): string {
    const american = latinToAmerican(chord);
    return american !== chord && parseChord(american) ? american : chord;
}

/** "F#" -> "Fa#" en notación latina. */
export const formatNote = (name: string, style: NameStyle): string =>
    style === 'latin' ? americanToLatin(name) : name;

/** "Bbm7b5" -> "Sibm7b5" en notación latina. */
export const formatChordSymbol = (symbol: string, style: NameStyle): string =>
    style === 'latin' ? americanToLatin(symbol) : symbol;

/** Texto de una tonalidad en la notación elegida: "Am" -> "Lam" en latina. */
export function formatKeyLabel(keyText: string, style: NameStyle): string {
    if (style !== 'latin') return keyText;
    const minor = keyText.endsWith('m');
    const latin = americanToLatin(minor ? keyText.slice(0, -1) : keyText);
    return minor ? `${latin}m` : latin;
}

/* ---------- Separar un acorde para mostrarlo ---------- */

/** `Fa(?!dd)` evita confundir el americano "Fadd9" con "Fa" + "dd9". */
const LATIN_CHORD = /^(Do|Re|Mi|Fa(?!dd)|Sol|La|Si)([#b]?)(m(?!aj))?([^/]*)$/;
const AMERICAN_CHORD = /^([A-G][#b]?)(m(?!aj))?([^/]*)$/;

/**
 * Separa la parte principal de un acorde (sin bajo) en base y extensión:
 * "Am7" -> { base: "Am", sup: "7" }; "Mim7" -> { base: "Mim", sup: "7" }. Null si no es un acorde con nota.
 */
export function splitNoteChord(main: string): { base: string; sup: string } | null {
    const latin = main.match(LATIN_CHORD);
    if (latin) return { base: (latin[1] ?? '') + (latin[2] ?? '') + (latin[3] ?? ''), sup: latin[4] ?? '' };
    const american = main.match(AMERICAN_CHORD);
    if (american) return { base: (american[1] ?? '') + (american[2] ?? ''), sup: american[3] ?? '' };
    return null;
}
