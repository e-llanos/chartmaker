import { ROMAN_NUMERALS } from '@/domain/music/core/analysis';
import {
    CHORD_QUALITIES,
    qualityFromStack,
    type ChordGroup,
    type ChordQuality,
} from '@/domain/music/core/chord-quality';
import { mod, parseNote, spell, type SpelledNote } from './notes';
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
    const n = scale.notes;
    if (n.length !== 7) return null;
    const functions = FUNCTIONS_BY_SCALE[scale.def.id];
    const rel = (from: number, to: number) => mod((n[to % 7]?.semis ?? 0) - (n[from]?.semis ?? 0), 12);

    return n.map((note, i) => {
        const third = rel(i, i + 2);
        const fifth = rel(i, i + 4);
        const seventh = rel(i, i + 6);
        const names = (steps: number[]) => steps.map((s) => n[(i + s) % 7]?.name ?? '');
        const prefix = PLAIN_ROMANS.has(scale.def.id) ? '' : (scale.def.formula[i] ?? '').replace(/\d+/, '');
        const numeral = third === 3 ? (ROMAN_NUMERALS[i] ?? '').toLowerCase() : (ROMAN_NUMERALS[i] ?? '');
        const tri = qualityFromStack(third, fifth);
        const sev = qualityFromStack(third, fifth, seventh);
        return {
            degree: i + 1,
            root: note.name,
            fn: functions?.[i],
            triad: tri ? { symbol: note.name + tri.symbol, notes: names([0, 2, 4]), roman: prefix + numeral + tri.roman } : null,
            seventh: sev ? { symbol: note.name + sev.symbol, notes: names([0, 2, 4, 6]), roman: prefix + numeral + sev.roman } : null,
        };
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