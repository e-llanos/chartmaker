/**
 * Compatibilidad temporal: el chart avanzado ya no es un modelo aparte, es el mismo Chart con
 * estilo 'advanced'. Estos alias se eliminan al unificar la interfaz.
 */
import type { Chart, ChartMeasure, ChartSection } from '@/domain/chart/types';

export { MEASURE_MARKS, MEASURE_MARK_KEYS } from '@/domain/chart/types';
export type { LeftBar, MeasureMark, RightBar } from '@/domain/chart/types';

export type ScoreMeasure = ChartMeasure;
export type ScoreSection = ChartSection;
export type Score = Chart;