import { parseSections } from '@/domain/chordsheet/parse-sections';
import { normalizeChord } from '@/domain/music/engine';
import type { SectionType } from '@/domain/sections/section-types';
import type { Chart, ChartMeasure, ChartSection } from '@/domain/chart/types';
import { newId } from '@/domain/shared/ids';
import { beatsPerMeasure, padBeats } from '@/domain/music/meter';

export const DEFAULT_MEASURES = 4;

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