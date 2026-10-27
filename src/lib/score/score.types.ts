import type { SectionType } from '@/lib/sections/sectionTypes';

export type LeftBar = 'double' | 'repeat';
export type RightBar = 'double' | 'final' | 'repeat';

export const MEASURE_MARKS = {
    segno: 'Segno',
    coda: 'Coda',
    fermata: 'Calderón',
    toCoda: 'To Coda',
    dc: 'D.C.',
    ds: 'D.S.',
    dcCoda: 'D.C. al Coda',
    dsCoda: 'D.S. al Coda',
    fine: 'Fine',
} as const;

export type MeasureMark = keyof typeof MEASURE_MARKS;
export const MEASURE_MARK_KEYS = Object.keys(MEASURE_MARKS) as MeasureMark[];

export interface ScoreMeasure {
    /** Un acorde por tiempo ('' = sin acorde, se dibuja la marca del tiempo). */
    beats: string[];
    /** Barra al inicio del compás (omitida = simple). */
    left?: LeftBar;
    /** Barra al final del compás (omitida = simple). */
    right?: RightBar;
    /** Casilla de repetición: 1., 2. o 3. */
    ending?: 1 | 2 | 3;
    /** Repite el compás anterior (símbolo %). */
    simile?: true;
    marks?: MeasureMark[];
    note?: string;
}

export interface ScoreSection {
    id: string;
    type: SectionType;
    label: string;
    note: string;
    repeat: number;
    /** Compases por fila (2 a 8). */
    perRow: number;
    measures: ScoreMeasure[];
}

export interface Score {
    sections: ScoreSection[];
}