import { newId, padBeats } from '@/lib/chart/chart.utils';
import type { Chart } from '@/lib/chart/chart.types';
import type { SectionType } from '@/lib/sections/sectionTypes';
import type { Score, ScoreMeasure, ScoreSection } from './score.types';

export const DEFAULT_PER_ROW = 4;
export const PER_ROW_OPTIONS = [2, 3, 4, 5, 6, 8] as const;

export type BarKind =
    | 'single' | 'double' | 'final'
    | 'repeat-start' | 'repeat-end' | 'repeat-both';

/** Barra que separa dos compases (o abre/cierra una fila si falta uno de ellos). */
export function barBetween(prev?: ScoreMeasure, next?: ScoreMeasure): BarKind {
    const r = prev?.right;
    const l = next?.left;
    if (r === 'repeat' && l === 'repeat') return 'repeat-both';
    if (r === 'repeat') return 'repeat-end';
    if (l === 'repeat') return 'repeat-start';
    if (r === 'final') return 'final';
    if (r === 'double' || l === 'double') return 'double';
    return 'single';
}

export function chunk<T>(items: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
}

/** "4/4" -> { num: '4', den: '4' } para dibujar el compás en el margen. */
export function timeSignature(compas: string): { num: string; den: string } {
    const [num = '4', den = '4'] = compas.split('/');
    return { num, den };
}

export function emptyScoreMeasure(count: number): ScoreMeasure {
    return { beats: padBeats([], count) };
}

export function newScoreSection(type: SectionType, label: string, count: number): ScoreSection {
    return {
        id: newId(),
        type,
        label,
        note: '',
        repeat: 1,
        perRow: DEFAULT_PER_ROW,
        measures: Array.from({ length: 4 }, () => emptyScoreMeasure(count)),
    };
}

/** Convierte un chart simple en avanzado: repeticiones -> barras, y barra final al cerrar. */
export function scoreFromChart(chart: Chart, count: number): Score {
    const sections = chart.sections.map<ScoreSection>((s) => {
        const measures = s.measures.map<ScoreMeasure>((m) => {
            const out: ScoreMeasure = { beats: padBeats(m.beats, count) };
            if ((m.repeat ?? 1) > 1) {
                out.left = 'repeat';
                out.right = 'repeat';
            }
            return out;
        });
        if (s.repeat > 1) {
            const first = measures[0];
            const last = measures[measures.length - 1];
            if (first) first.left = 'repeat';
            if (last) last.right = 'repeat';
        }
        return {
            id: newId(),
            type: s.type,
            label: s.label,
            note: s.note,
            repeat: s.repeat,
            perRow: DEFAULT_PER_ROW,
            measures,
        };
    });

    const lastSection = sections[sections.length - 1];
    const lastMeasure = lastSection?.measures[lastSection.measures.length - 1];
    if (lastMeasure && !lastMeasure.right) lastMeasure.right = 'final';

    return { sections };
}