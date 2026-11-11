/**
 * Compás como tipo. Reglas acordadas:
 *  - Por defecto se cuenta por PULSOS (6/8 = 2, 9/8 = 3, 12/8 = 4); opcionalmente por SUBDIVISIONES (corcheas).
 *  - Solo son compuestos 6, 9 y 12 sobre 8 o 16. 3/8 es un compás simple de 3.
 *  - 5/8 y 7/8 son irregulares: se agrupan 3+2 y 2+2+3 (la agrupación se puede indicar).
 *  - El denominador debe ser una figura real (1, 2, 4, 8 o 16): "0/0" y "4/3" no son compases.
 */

export type NoteValue = 1 | 2 | 4 | 8 | 16;
export type MeterKind = 'simple' | 'compound' | 'irregular';
/** Cómo se reparten las casillas de un compás: una por pulso o una por subdivisión. */
export type SlotMode = 'pulses' | 'subdivisions';

export interface TimeSignature {
    numerator: number;
    denominator: NoteValue;
    /** Unidades que cubre cada pulso, en orden. Si falta, se usa la agrupación por defecto. */
    grouping?: number[];
}

/** Máximo de casillas por compás: el mismo que acepta el chart. */
export const MAX_SLOTS = 12;
export const DEFAULT_TIME_SIGNATURE: TimeSignature = { numerator: 4, denominator: 4 };

const NUMERATOR_MAX = 16;
const NOTE_VALUES: readonly number[] = [1, 2, 4, 8, 16];

const isNoteValue = (n: number): n is NoteValue => NOTE_VALUES.includes(n);

/** "6/8" -> { numerator: 6, denominator: 8 }. Null si no es un compás válido. */
export function parseTimeSignature(text: string): TimeSignature | null {
    const m = text.trim().match(/^(\d{1,2})\s*\/\s*(\d{1,2})$/);
    if (!m) return null;
    const numerator = Number(m[1]);
    const denominator = Number(m[2]);
    if (numerator < 1 || numerator > NUMERATOR_MAX || !isNoteValue(denominator)) return null;
    return { numerator, denominator };
}

export const formatTimeSignature = (ts: TimeSignature): string => `${ts.numerator}/${ts.denominator}`;

export function meterKind(ts: TimeSignature): MeterKind {
    if (ts.denominator !== 8 && ts.denominator !== 16) return 'simple';
    if (ts.numerator === 6 || ts.numerator === 9 || ts.numerator === 12) return 'compound';
    if (ts.numerator === 5 || ts.numerator === 7) return 'irregular';
    return 'simple';
}

/** Cómo se agrupan las unidades en pulsos: 6/8 -> [3, 3]; 7/8 -> [2, 2, 3]; 4/4 -> [1, 1, 1, 1]. */
export function defaultGrouping(ts: TimeSignature): number[] {
    switch (meterKind(ts)) {
        case 'compound': return Array.from({ length: ts.numerator / 3 }, () => 3);
        case 'irregular': return ts.numerator === 5 ? [3, 2] : [2, 2, 3];
        default: return Array.from({ length: ts.numerator }, () => 1);
    }
}

/** ¿La agrupación indicada cubre exactamente el compás? */
export function isValidGrouping(ts: TimeSignature, grouping: number[]): boolean {
    return grouping.length > 0
        && grouping.every((g) => Number.isInteger(g) && g >= 1)
        && grouping.reduce((a, b) => a + b, 0) === ts.numerator;
}

export function groupingOf(ts: TimeSignature): number[] {
    return ts.grouping && isValidGrouping(ts, ts.grouping) ? ts.grouping : defaultGrouping(ts);
}

/** Pulsos por compás: 4/4 = 4, 6/8 = 2, 7/8 = 3. */
export const pulsesPerMeasure = (ts: TimeSignature): number => groupingOf(ts).length;

/**
 * Subdivisiones por compás, contadas en corcheas: 4/4 = 8, 3/4 = 6, 6/8 = 6, 12/8 = 12.
 * Con denominador 16 se cuentan semicorcheas (la unidad escrita).
 */
export function subdivisionsPerMeasure(ts: TimeSignature): number {
    return ts.denominator >= 8 ? ts.numerator : ts.numerator * (8 / ts.denominator);
}

/** Casillas por compás en el chart, entre 1 y MAX_SLOTS. */
export function slotsPerMeasure(ts: TimeSignature, mode: SlotMode = 'pulses'): number {
    const n = mode === 'pulses' ? pulsesPerMeasure(ts) : subdivisionsPerMeasure(ts);
    return Math.max(1, Math.min(MAX_SLOTS, n));
}

/**
 * Casillas por compás de un texto de compás. Por pulsos (4/4 -> 4, 6/8 -> 2, 12/8 -> 4)
 * o, con `mode: 'subdivisions'`, por corcheas (6/8 -> 6). Un compás inválido cuenta como 4/4.
 */
export function beatsPerMeasure(compas: string, mode: SlotMode = 'pulses'): number {
    return slotsPerMeasure(parseTimeSignature(compas) ?? DEFAULT_TIME_SIGNATURE, mode);
}
