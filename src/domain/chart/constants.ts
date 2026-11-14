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
export const MEASURE_MARK_KEYS = Object.keys(MEASURE_MARKS) as [MeasureMark, ...MeasureMark[]];

/** Cómo se ve y se edita un chart. Los datos son los mismos en ambos estilos. */
export const CHART_STYLES = ['simple', 'advanced'] as const;
export type ChartStyle = (typeof CHART_STYLES)[number];

export const CHART_STYLE_LABELS: Record<ChartStyle, string> = {
    simple: 'Simple',
    advanced: 'Avanzado',
};

/** Compases por fila en el estilo avanzado. */
export const DEFAULT_PER_ROW = 4;
export const PER_ROW_OPTIONS = [2, 3, 4, 5, 6, 8] as const;


/** Límites de tamaño de un chart (los hace cumplir la validación de la API y de los archivos). */
export const CHART_LIMITS = {
    sections: 80,
    measures: 256,
    beats: 12,
    beatLen: 24,
    text: 200,
    measureNote: 80,
    marks: 9,
    repeat: 99,
} as const;