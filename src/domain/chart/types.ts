import type { SectionType } from '@/domain/sections/section-types';

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

/** Cómo se ve y se edita un chart. Los datos son los mismos en ambos estilos. */
export type ChartStyle = 'simple' | 'advanced';

/** Compases por fila en el estilo avanzado. */
export const DEFAULT_PER_ROW = 4;
export const PER_ROW_OPTIONS = [2, 3, 4, 5, 6, 8] as const;

export interface ChartMeasure {
    /** Un acorde por tiempo ('' = sin acorde, se dibuja la marca del tiempo). */
    beats: string[];
    /** Compás repetido ×N (omitido = 1). */
    repeat?: number;
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

export interface ChartSection {
    id: string;
    type: SectionType;
    label: string;
    note: string;
    repeat: number;
    /** Compases por fila (2 a 8). Solo lo usa el estilo avanzado. */
    perRow: number;
    measures: ChartMeasure[];
}

export interface Chart {
    style: ChartStyle;
    sections: ChartSection[];
}

export const CHART_STYLE_LABELS: Record<ChartStyle, string> = {
    simple: 'Simple',
    advanced: 'Avanzado',
};