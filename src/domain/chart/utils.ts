import { parseSections } from '@/domain/chordsheet/parse-sections';
import { beatsPerMeasure } from '@/domain/music/core/meter';
import { normalizeChord } from '@/domain/music/notation/engine';
import { DEFAULT_PER_ROW, type Chart, type ChartMeasure, type ChartSection, type ChartStyle } from '@/domain/chart/types';
import type { SectionType } from '@/domain/sections/section-types';
import { padBeats } from '@/domain/shared/beats';
import { newId } from '@/domain/shared/ids';

export const DEFAULT_MEASURES = 4;

export const emptyChart = (style: ChartStyle = 'simple'): Chart => ({ style, sections: [] });

export function emptyMeasure(count: number): ChartMeasure {
    return { beats: padBeats([], count) };
}

export function newSection(type: SectionType, label: string, count: number): ChartSection {
    return {
        id: newId(),
        type,
        label,
        note: '',
        repeat: 1,
        perRow: DEFAULT_PER_ROW,
        measures: Array.from({ length: DEFAULT_MEASURES }, () => emptyMeasure(count)),
    };
}

export interface BeatSegment {
    chord: string;
    span: number;
}

/** Agrupa los tiempos: cada acorde ocupa los tiempos vacíos que le siguen. */
export function segments(beats: string[]): BeatSegment[] {
    const out: BeatSegment[] = [];
    for (const raw of beats) {
        const chord = raw.trim();
        const last = out[out.length - 1];
        if (chord || !last) out.push({ chord, span: 1 });
        else last.span += 1;
    }
    return out;
}

/** Punto de partida: un compás por cada acorde del cifrado, en orden. */
export function chartFromChordPro(body: string, compas: string, style: ChartStyle = 'simple'): Chart {
    const count = beatsPerMeasure(compas);
    const sections = parseSections(body).map<ChartSection>((s) => {
        const chords = s.lines.flatMap((l) =>
            'tokens' in l
                ? l.tokens.map((t) => t.chord).filter((c): c is string => Boolean(c))
                : []
        );
        return {
            id: newId(),
            type: s.type,
            label: s.label,
            note: s.note,
            repeat: s.repeat,
            perRow: DEFAULT_PER_ROW,
            measures: chords.slice(0, 256).map((c) => ({
                beats: padBeats([normalizeChord(c)], count),
            })),
        };
    });
    return { style, sections };
}

/* ---------- Estilo avanzado ---------- */

export type BarKind =
    | 'single' | 'double' | 'final'
    | 'repeat-start' | 'repeat-end' | 'repeat-both';

/** Barra que separa dos compases (o abre/cierra una fila si falta uno de ellos). */
export function barBetween(prev?: ChartMeasure, next?: ChartMeasure): BarKind {
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