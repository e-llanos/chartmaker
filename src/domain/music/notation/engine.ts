/**
 * src/domain/music/notation/engine.ts
 * API de acordes para el visor y los editores: transposición y conversión
 * americana / latina / Nashville / romana. Todo se apoya en `core`; ya no hay librerías externas.
 *
 * Los números romanos y Nashville se calculan respecto a la TÓNICA (igual que la sección de teoría).
 * Con `reference: 'relativeMajor'` una tonalidad menor se mide desde su relativa mayor (en Em, Em = vi).
 */
import { analyzeChord, type KeyReference } from '@/domain/music/core/analysis';
import { parseChord } from '@/domain/music/core/chord';
import { stackThirds } from '@/domain/music/core/diatonic';
import { spell } from '@/domain/music/core/interval';
import {
    MAJOR_FORMULA,
    NATURAL_MINOR_FORMULA,
    keyDistance,
    normalizeSongKey,
    parseKey,
} from '@/domain/music/core/key';
import { americanToLatin, formatKeyLabel as formatKeyLabelIn, normalizeChord } from '@/domain/music/core/notation';
import { parseNote } from '@/domain/music/core/pitch';
import { transposeChordText, transposeKey } from '@/domain/music/core/transpose';

export { americanToLatin, latinToAmerican, normalizeChord } from '@/domain/music/core/notation';

export type Notation = 'symbol' | 'latin' | 'nashville' | 'roman';

/** `symbol` = americana (C D E). El orden define el orden del selector. */
export const NOTATION_LABELS: Record<Notation, string> = {
    symbol: 'Americano',
    latin: 'Latino',
    nashville: 'Nashville',
    roman: 'Romanos',
};

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
    const target = originalKey ? transposeKey(originalKey, semitones) : null;
    return transposeChordText(input, semitones, target ? parseKey(target) : null) ?? chordString;
}

/** Convierte un acorde a la notación pedida respecto a `key`. */
export function convertChordString(
    chordString: string,
    notation: Notation,
    key: string,
    reference: KeyReference = 'tonic',
): string {
    if (!chordString) return chordString;
    const normalized = normalizeChord(chordString);
    if (notation === 'symbol') return normalized;

    const chord = parseChord(normalized);
    if (!chord) return chordString;
    if (notation === 'latin') return americanToLatin(normalized);

    const analysis = analyzeChord(chord, key, { reference });
    if (!analysis) return chordString;
    return notation === 'nashville'
        ? analysis.nashville + (analysis.bass ? `/${analysis.bass}` : '')
        : analysis.roman + (analysis.bassRoman ? `/${analysis.bassRoman}` : '');
}

/** Texto de una tonalidad en la notación elegida: "Am" -> "Lam" en latina. */
export const formatKeyLabel = (key: string, notation: Notation): string =>
    formatKeyLabelIn(key, notation === 'latin' ? 'latin' : 'symbol');

/** Distancia en semitonos (-5..6) entre dos tonalidades, ignorando el modo. */
export function semitoneDistance(fromKey: string, toKey: string): number {
    return keyDistance(fromKey, toKey) ?? 0;
}

/** Acordes diatónicos de la tonalidad, para la paleta rápida del editor (en mayor sin el disminuido). */
export function diatonicChords(key: string): string[] {
    const parsed = parseKey(key);
    const practical = parsed ? parseKey(normalizeSongKey(key)?.key ?? key) : null;
    const tonic = practical ? parseNote(practical.tonic) : null;
    if (!practical || !tonic) return [];
    const formula = practical.mode === 'minor' ? NATURAL_MINOR_FORMULA : MAJOR_FORMULA;
    const stacked = stackThirds(formula.map((token) => spell(tonic, token))) ?? [];
    const chords = stacked.flatMap((c) => (c.triad ? [c.root + c.triad.quality.symbol] : []));
    return practical.mode === 'minor' ? chords : chords.slice(0, 6);
}
