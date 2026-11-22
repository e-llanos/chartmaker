import type { ChartMeasure, ChartSection, ChartStyle } from '@/domain/chart/types';
import type { Badge } from '@/domain/sections/section-types';
import { SECTION_TYPES } from '@/domain/sections/section-types';
import { padBeats } from '@/domain/shared/beats';
import type { PdfLayout } from './pdf-sheet';

export interface PdfChartSection {
    badge: { text: string; color: string };
    label: string;
    note: string;
    repeat: number;
    perRow: number;
    /** Compases con los acordes ya transpuestos y en la notación elegida. */
    measures: ChartMeasure[];
}

export interface PdfChart {
    title: string;
    artist: string;
    meta: string[];
    style: ChartStyle;
    /** Compás para el margen del estilo avanzado: { num: '4', den: '4' }. */
    time: { num: string; den: string };
    sections: PdfChartSection[];
    layout: PdfLayout;
}

interface BuildArgs {
    title: string;
    artist: string;
    meta: string[];
    style: ChartStyle;
    time: { num: string; den: string };
    /** Tiempos por compás. */
    count: number;
    sections: ChartSection[];
    badges: Badge[];
    mapChord: (chord: string) => string;
    layout: PdfLayout;
}

export function buildPdfChart({ title, artist, meta, style, layout, time, count, sections, badges, mapChord }: BuildArgs): PdfChart {
    return {
        title: title || 'Sin título',
        artist,
        meta,
        style,
        layout,
        time,
        sections: sections.map((s, i) => ({
            badge: { text: badges[i]?.text ?? '', color: badges[i]?.color ?? '#888888' },
            label: s.label || SECTION_TYPES[s.type].label,
            note: s.note,
            repeat: s.repeat,
            perRow: s.perRow,
            measures: s.measures.map((m) => ({
                ...m,
                beats: padBeats(m.beats, count).map((b) => (b.trim() ? mapChord(b.trim()) : '')),
            })),
        })),
    };
}