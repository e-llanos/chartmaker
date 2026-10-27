import { parseSections } from '@/lib/cifrado/parseSections';
import { normalizeChord } from '@/lib/music/engine';
import type { SectionType } from '@/lib/sections/sectionTypes';
import type { Chart, ChartMeasure, ChartSection } from './chart.types';

export const DEFAULT_MEASURES = 4;

export function newId(): string {
    return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Tiempos por compás: 4/4 -> 4, 3/4 -> 3, 6/8 -> 2, 12/8 -> 4. */
export function beatsPerMeasure(compas: string): number {
    const m = compas.match(/^(\d{1,2})\s*\/\s*(\d{1,2})$/);
    if (!m) return 4;
    const n = Number(m[1]);
    const d = Number(m[2]);
    const beats = d === 8 && n % 3 === 0 ? n / 3 : n;
    return Math.max(1, Math.min(8, beats));
}

/** Rellena con vacíos hasta `count` tiempos, sin recortar los existentes. */
export function padBeats(beats: string[], count: number): string[] {
    return Array.from({ length: Math.max(count, beats.length) }, (_, i) => beats[i] ?? '');
}

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
export function chartFromChordPro(body: string, compas: string): Chart {
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
            measures: chords.slice(0, 256).map((c) => ({
                beats: padBeats([normalizeChord(c)], count),
            })),
        };
    });
    return { sections };
}