import type { SectionType } from '@/domain/sections/section-types';
import type { ChartStyle, MeasureMark } from './constants';

export * from './constants';

export type LeftBar = 'double' | 'repeat';
export type RightBar = 'double' | 'final' | 'repeat';

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
    simile?: boolean;
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