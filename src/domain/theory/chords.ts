import { mod, parseNote, spell, type SpelledNote } from './notes';
import type { BuiltScale } from './scales';

export type ChordGroup = 'triad' | 'sus' | 'sixth' | 'seventh' | 'ninth';

export const CHORD_GROUPS: Array<{ id: ChordGroup; label: string }> = [
    { id: 'triad', label: 'Tríadas' },
    { id: 'sus', label: 'Suspendidos' },
    { id: 'sixth', label: 'Sextas' },
    { id: 'seventh', label: 'Séptimas' },
    { id: 'ninth', label: 'Novenas' },
];

export interface ChordQuality {
    id: string;
    /** Sufijo del cifrado: "", "m", "maj7"… */
    symbol: string;
    name: string;
    group: ChordGroup;
    formula: string[];
}

export const CHORD_QUALITIES: ChordQuality[] = [
    { id: 'maj', symbol: '', name: 'Mayor', group: 'triad', formula: ['1', '3', '5'] },
    { id: 'min', symbol: 'm', name: 'Menor', group: 'triad', formula: ['1', 'b3', '5'] },
    { id: 'dim', symbol: 'dim', name: 'Disminuido', group: 'triad', formula: ['1', 'b3', 'b5'] },
    { id: 'aug', symbol: 'aug', name: 'Aumentado', group: 'triad', formula: ['1', '3', '#5'] },
    { id: 'sus2', symbol: 'sus2', name: 'Suspendido 2', group: 'sus', formula: ['1', '2', '5'] },
    { id: 'sus4', symbol: 'sus4', name: 'Suspendido 4', group: 'sus', formula: ['1', '4', '5'] },
    { id: '7sus4', symbol: '7sus4', name: 'Séptima suspendida', group: 'sus', formula: ['1', '4', '5', 'b7'] },
    { id: '6', symbol: '6', name: 'Sexta', group: 'sixth', formula: ['1', '3', '5', '6'] },
    { id: 'm6', symbol: 'm6', name: 'Menor con sexta', group: 'sixth', formula: ['1', 'b3', '5', '6'] },
    { id: '7', symbol: '7', name: 'Dominante (séptima)', group: 'seventh', formula: ['1', '3', '5', 'b7'] },
    { id: 'maj7', symbol: 'maj7', name: 'Mayor con séptima mayor', group: 'seventh', formula: ['1', '3', '5', '7'] },
    { id: 'm7', symbol: 'm7', name: 'Menor con séptima', group: 'seventh', formula: ['1', 'b3', '5', 'b7'] },
    { id: 'mMaj7', symbol: 'm(maj7)', name: 'Menor con séptima mayor', group: 'seventh', formula: ['1', 'b3', '5', '7'] },
    { id: 'm7b5', symbol: 'm7b5', name: 'Semidisminuido', group: 'seventh', formula: ['1', 'b3', 'b5', 'b7'] },
    { id: 'dim7', symbol: 'dim7', name: 'Disminuido con séptima', group: 'seventh', formula: ['1', 'b3', 'b5', 'bb7'] },
    { id: 'add9', symbol: 'add9', name: 'Mayor con novena añadida', group: 'ninth', formula: ['1', '3', '5', '9'] },
    { id: '9', symbol: '9', name: 'Dominante con novena', group: 'ninth', formula: ['1', '3', '5', 'b7', '9'] },
    { id: 'maj9', symbol: 'maj9', name: 'Mayor con séptima y novena', group: 'ninth', formula: ['1', '3', '5', '7', '9'] },
    { id: 'm9', symbol: 'm9', name: 'Menor con novena', group: 'ninth', formula: ['1', 'b3', '5', 'b7', '9'] },
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

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/** En las escalas menores los romanos no llevan alteraciones (i ii° III iv v VI VII); en los modos sí (bIII, bVII…). */
const PLAIN_ROMANS = new Set(['natural-minor', 'harmonic-minor', 'melodic-minor']);

/** Tríadas por terceras: clave "tercera-quinta" en semitonos. */
const TRIADS: Record<string, { symbol: string; roman: string }> = {
    '4-7': { symbol: '', roman: '' },
    '3-7': { symbol: 'm', roman: '' },
    '3-6': { symbol: 'dim', roman: '°' },
    '4-8': { symbol: 'aug', roman: '+' },
};

/** Cuatríadas: clave "tercera-quinta-séptima". */
const SEVENTHS: Record<string, { symbol: string; roman: string }> = {
    '4-7-11': { symbol: 'maj7', roman: 'maj7' },
    '4-7-10': { symbol: '7', roman: '7' },
    '3-7-10': { symbol: 'm7', roman: '7' },
    '3-7-11': { symbol: 'm(maj7)', roman: '(maj7)' },
    '3-6-10': { symbol: 'm7b5', roman: 'ø7' },
    '3-6-9': { symbol: 'dim7', roman: '°7' },
    '4-8-10': { symbol: '7#5', roman: '+7' },
    '4-8-11': { symbol: 'maj7#5', roman: '+maj7' },
    '4-6-10': { symbol: '7b5', roman: '7b5' },
};

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
        const numeral = third === 3 ? (ROMAN[i] ?? '').toLowerCase() : (ROMAN[i] ?? '');
        const tri = TRIADS[`${third}-${fifth}`];
        const sev = SEVENTHS[`${third}-${fifth}-${seventh}`];
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