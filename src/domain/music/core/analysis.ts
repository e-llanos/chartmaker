/**
 * Análisis de un acorde dentro de una tonalidad: grado, número romano y número Nashville.
 *
 * Regla acordada: se numera respecto a la TÓNICA. Quien lo prefiera puede pedir la
 * "relativa mayor" (en Em, Em = vi y G = I). Con la tónica como referencia:
 *  - Romanos: en tonalidades menores la base es la menor natural (i ii° III iv v VI VII),
 *    igual que en la teoría; los acordes fuera de la escala llevan b o # (bII, #iv°).
 *  - Nashville: los números se miden contra la escala mayor de la tónica (Em = 1m, C = b6).
 */
import { parseChord, type Chord } from './chord';
import { findQuality, romanStyle } from './chord-quality';
import { degreeSemitones } from './interval';
import { MAJOR_FORMULA, NATURAL_MINOR_FORMULA, parseKey, relativeKey, type Key } from './key';
import { mod, parseNote } from './pitch';

export type KeyReference = 'tonic' | 'relativeMajor';

export interface AnalyzeOptions {
    /** Por defecto 'tonic'. */
    reference?: KeyReference;
}

export interface ChordAnalysis {
    /** Grado (1–7) de la raíz respecto a la escala de referencia, contado por letras. */
    degree: number;
    /** Alteración respecto a esa escala: -1 = bemol (bVII), 0 = de la escala, 1 = sostenido. */
    alteration: number;
    /** La raíz pertenece a la escala de referencia. */
    inKey: boolean;
    /** Número romano: "vi", "bVII", "V7", "iiø7". */
    roman: string;
    /** Número Nashville: "6m", "b7", "57". Conserva el sufijo tal como se escribió. */
    nashville: string;
    /** Bajo alterno como grado Nashville ("3" en C/E, "b7" en C/Bb). */
    bass?: string;
    /** Bajo alterno en romanos ("III" en C/E, "bVII" en C/Bb). */
    bassRoman?: string;
}

const MAJOR_SEMIS = MAJOR_FORMULA.map(degreeSemitones);
const MINOR_SEMIS = NATURAL_MINOR_FORMULA.map(degreeSemitones);
export const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;

/** Sufijo desconocido: minúscula si empieza como menor o disminuido. */
const LOOKS_MINOR = /^(?:m(?!a)|-|dim|°|ø)/;
const MINOR_MARK = /^(?:min|mi|m|-)/;

const prefixOf = (alteration: number): string =>
    alteration > 0 ? '#'.repeat(alteration) : alteration < 0 ? 'b'.repeat(-alteration) : '';

interface Placement {
    degree: number;
    alteration: number;
}

/** Grado y alteración (respecto a la escala mayor) de cada intervalo cuando la nota no es de la escala. */
const CHROMATIC: ReadonlyArray<readonly [number, number]> = [
    [1, 0], [2, -1], [2, 0], [3, -1], [3, 0], [4, 0], [4, 1], [5, 0], [6, -1], [6, 0], [7, -1], [7, 0],
];

/** Escrituras alteradas que se respetan tal como las escribió el usuario: b2 b3 b5 b6 b7 y #1 #2 #4 #5. */
const SPELLINGS_KEPT = new Set(['2,-1', '3,-1', '5,-1', '6,-1', '7,-1', '1,1', '2,1', '4,1', '5,1']);

const normalize = (n: number): number => mod(n + 6, 12) - 6;

/**
 * Grado de una nota respecto a una tónica. Se respeta la ortografía (Ab en Do = b6) cuando es un
 * grado cromático estándar; si no (Db en Re, A# en Do), se usa el grado que corresponde a su altura.
 */
function degreeOf(tonicName: string, noteName: string): { degree: number; interval: number } | null {
    const tonic = parseNote(tonicName);
    const note = parseNote(noteName);
    if (!tonic || !note) return null;
    const interval = mod(note.pc - tonic.pc, 12);
    const spelled = mod(note.letter - tonic.letter, 7) + 1;
    const alt = normalize(interval - (MAJOR_SEMIS[spelled - 1] ?? 0));
    if (alt === 0 || SPELLINGS_KEPT.has(`${spelled},${alt}`)) return { degree: spelled, interval };
    return { degree: CHROMATIC[interval]?.[0] ?? spelled, interval };
}

/** Posición de una nota respecto a una tónica y una escala (en semitonos por grado). */
function place(tonicName: string, noteName: string, scale: readonly number[]): Placement | null {
    const found = degreeOf(tonicName, noteName);
    if (!found) return null;
    return { degree: found.degree, alteration: normalize(found.interval - (scale[found.degree - 1] ?? 0)) };
}

function romanOf(chord: Chord, at: Placement): string {
    const quality = chord.quality ? findQuality(chord.quality) : null;
    const style = quality ? romanStyle(quality) : null;
    const lower = style ? style.lower : LOOKS_MINOR.test(chord.suffix);
    const suffix = style ? style.suffix : lower ? chord.suffix.replace(MINOR_MARK, '') : chord.suffix;
    const numeral = ROMAN_NUMERALS[at.degree - 1] ?? '';
    return prefixOf(at.alteration) + (lower ? numeral.toLowerCase() : numeral) + suffix;
}

/** Analiza un acorde en una tonalidad. Null si el acorde o la tonalidad no son válidos. */
export function analyzeChord(
    chord: Chord | string,
    key: Key | string,
    options: AnalyzeOptions = {},
): ChordAnalysis | null {
    const parsed = typeof chord === 'string' ? parseChord(chord) : chord;
    const k = typeof key === 'string' ? parseKey(key) : key;
    if (!parsed || !k) return null;

    // Referencia 'relativeMajor': una tonalidad menor se mide desde su relativa mayor.
    const relative = options.reference === 'relativeMajor' && k.mode === 'minor' ? relativeKey(k) : null;
    const ref: Key = relative ?? k;
    const romanScale = ref.mode === 'minor' ? MINOR_SEMIS : MAJOR_SEMIS;

    const forRoman = place(ref.tonic, parsed.root, romanScale);
    const forNashville = place(ref.tonic, parsed.root, MAJOR_SEMIS);
    if (!forRoman || !forNashville) return null;

    const bass = parsed.bass ? place(ref.tonic, parsed.bass, MAJOR_SEMIS) : null;
    const bassRoman = parsed.bass ? place(ref.tonic, parsed.bass, romanScale) : null;
    // Un sufijo desconocido no impide numerar: se conserva tal cual.
    return {
        degree: forRoman.degree,
        alteration: forRoman.alteration,
        inKey: forRoman.alteration === 0,
        roman: romanOf(parsed, forRoman),
        nashville: `${prefixOf(forNashville.alteration)}${forNashville.degree}${parsed.suffix}`,
        ...(bass ? { bass: `${prefixOf(bass.alteration)}${bass.degree}` } : {}),
        ...(bassRoman
            ? { bassRoman: prefixOf(bassRoman.alteration) + (ROMAN_NUMERALS[bassRoman.degree - 1] ?? '') }
            : {}),
    };
}
