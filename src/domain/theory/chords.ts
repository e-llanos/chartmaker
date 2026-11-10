import { ROMAN_NUMERALS } from '@/domain/music/core/analysis';
import { stackThirds, type StackedChord } from '@/domain/music/core/diatonic';
import {
    CHORD_QUALITIES,
    type ChordGroup,
    type ChordQuality,
} from '@/domain/music/core/chord-quality';
import { parseNote, spell, type SpelledNote } from './notes';
import type { BuiltScale } from './scales';

export { CHORD_QUALITIES, type ChordGroup, type ChordQuality };

export const CHORD_GROUPS: Array<{ id: ChordGroup; label: string }> = [
    { id: 'triad', label: 'Tríadas' },
    { id: 'sus', label: 'Suspendidos' },
    { id: 'sixth', label: 'Sextas' },
    { id: 'seventh', label: 'Séptimas' },
    { id: 'ninth', label: 'Novenas' },
];

export interface BuiltChord {
    /** Cifrado completo: "Am7". */
    symbol: string;
    quality: ChordQuality;
    notes: SpelledNote[];
}

export function buildChord(root: string, qualityId: string): BuiltChord | null {
    const quality = CHORD_QUALITIES.find((q) => q.id === qualityId);
    const r = parseNote(root);
    if (!quality || !r) return null;
    return { symbol: root + quality.symbol, quality, notes: quality.formula.map((t) => spell(r, t)) };
}

/* ---------- Acordes de una escala ---------- */

export type HarmonicFunction = 'T' | 'SD' | 'D';

export const FUNCTION_LABELS: Record<HarmonicFunction, string> = {
    T: 'Tónica',
    SD: 'Subdominante',
    D: 'Dominante',
};

const MAJOR_FUNCTIONS: HarmonicFunction[] = ['T', 'SD', 'T', 'SD', 'D', 'T', 'D'];
const MINOR_FUNCTIONS: HarmonicFunction[] = ['T', 'SD', 'T', 'SD', 'D', 'SD', 'D'];

const FUNCTIONS_BY_SCALE: Record<string, HarmonicFunction[]> = {
    major: MAJOR_FUNCTIONS,
    'natural-minor': MINOR_FUNCTIONS,
    'harmonic-minor': MINOR_FUNCTIONS,
    'melodic-minor': MINOR_FUNCTIONS,
};

/** En las escalas menores los romanos no llevan alteraciones (i ii° III iv v VI VII); en los modos sí (bIII, bVII…). */
const PLAIN_ROMANS = new Set(['natural-minor', 'harmonic-minor', 'melodic-minor']);

export interface ChordInfo {
    symbol: string;
    notes: string[];
    roman: string;
}

export interface DiatonicChord {
    degree: number;
    root: string;
    triad: ChordInfo | null;
    seventh: ChordInfo | null;
    fn?: HarmonicFunction;
}

/** Acordes que salen de apilar terceras sobre cada grado. Solo para escalas de 7 notas. */
export function diatonicChords(scale: BuiltScale): DiatonicChord[] | null {
    const stacked = stackThirds(scale.notes);
    if (!stacked) return null;
    const functions = FUNCTIONS_BY_SCALE[scale.def.id];

    return stacked.map((c, i) => {
        const prefix = PLAIN_ROMANS.has(scale.def.id) ? '' : (scale.def.formula[i] ?? '').replace(/\d+/, '');
        const numeral = c.third === 3 ? (ROMAN_NUMERALS[i] ?? '').toLowerCase() : (ROMAN_NUMERALS[i] ?? '');
        const info = (chord: StackedChord['triad']): ChordInfo | null =>
            chord ? { symbol: c.root + chord.quality.symbol, notes: chord.notes, roman: prefix + numeral + chord.quality.roman } : null;
        return { degree: c.degree, root: c.root, fn: functions?.[i], triad: info(c.triad), seventh: info(c.seventh) };
    });
}

const SEARCHED = ['maj', 'min', 'dim', 'aug', 'sus2', 'sus4', 'maj7', '7', 'm7', 'm7b5', 'dim7', 'mMaj7'];

/** Acordes cuyas notas están todas dentro de la escala, sobre cada una de sus notas. */
export function containedChords(scale: BuiltScale): Array<{ root: string; chords: BuiltChord[] }> {
    const pcs = new Set(scale.notes.map((n) => n.pc));
    return scale.notes
        .map((note) => ({
            root: note.name,
            chords: SEARCHED.map((id) => buildChord(note.name, id)).filter(
                (c): c is BuiltChord => c !== null && c.notes.every((x) => pcs.has(x.pc)),
            ),
        }))
        .filter((g) => g.chords.length > 0);
}