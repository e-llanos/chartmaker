'use client';

import type { ChartMeasure, ChartSection } from '@/domain/chart/types';
import { emptyMeasure } from '@/domain/chart/utils';
import { normalizeChord } from '@/domain/music/engine';
import { padBeats } from '@/domain/music/meter';
import SectionMetaFields, { SectionActions } from '@/shared/editor/SectionMetaFields';

interface SectionEditorProps {
    section: ChartSection;
    /** Tiempos por compás. */
    bpm: number;
    index: number;
    total: number;
    onChange: (section: ChartSection) => void;
    onMove: (dir: -1 | 1) => void;
    onRemove: () => void;
}

export default function SectionEditor({
    section, bpm, index, total, onChange, onMove, onRemove,
}: SectionEditorProps) {
    const patch = (changes: Partial<ChartSection>) => onChange({ ...section, ...changes });
    const setMeasures = (measures: ChartMeasure[]) => patch({ measures });

    function setBeat(m: number, b: number, value: string) {
        const measure = section.measures[m];
        if (!measure) return;
        const beats = padBeats(measure.beats, Math.max(bpm, measure.beats.length));
        beats[b] = value;
        setMeasures(section.measures.map((x, i) => (i === m ? { ...x, beats } : x)));
    }

    /** Alterna las repeticiones del compás entre 1 y 4. */
    function cycleRepeat(m: number) {
        const measure = section.measures[m];
        if (!measure) return;
        const next = (measure.repeat ?? 1) >= 4 ? 1 : (measure.repeat ?? 1) + 1;
        const updated: ChartMeasure = { beats: measure.beats };
        if (next > 1) updated.repeat = next;
        setMeasures(section.measures.map((x, i) => (i === m ? updated : x)));
    }

    function duplicate(m: number) {
        const measure = section.measures[m];
        if (!measure) return;
        const copy: ChartMeasure = { ...measure, beats: [...measure.beats] };
        setMeasures([...section.measures.slice(0, m + 1), copy, ...section.measures.slice(m + 1)]);
    }

    function removeMeasure(m: number) {
        setMeasures(section.measures.filter((_, i) => i !== m));
    }

    return (
        <div className="section-editor">
            <SectionMetaFields section={section} onChange={patch} notePlaceholder="Anotación (ej. Pad & Piano)" />

            <div className="measure-fields">
                {section.measures.map((m, j) => {
                    const repeat = m.repeat ?? 1;
                    return (
                        <div className="measure-field" key={j}>
                            <div className="measure-field-beats">
                                {padBeats(m.beats, bpm).map((beat, b) => (
                                    <input
                                        key={b}
                                        className="beat-input"
                                        value={beat}
                                        aria-label={`Compás ${j + 1}, tiempo ${b + 1}`}
                                        onChange={(e) => setBeat(j, b, e.target.value)}
                                        onBlur={(e) => {
                                            const clean = normalizeChord(e.target.value.trim());
                                            if (clean !== beat) setBeat(j, b, clean);
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="measure-field-actions">
                                <button type="button" aria-pressed={repeat > 1} title="Repetir compás"
                                    onClick={() => cycleRepeat(j)}>{repeat > 1 ? `×${repeat}` : '×'}</button>
                                <button type="button" title="Duplicar compás" onClick={() => duplicate(j)}>⧉</button>
                                <button type="button" className="danger" title="Eliminar compás"
                                    onClick={() => removeMeasure(j)}>✕</button>
                            </div>
                        </div>
                    );
                })}
                <button type="button" className="add-measure"
                    onClick={() => setMeasures([...section.measures, emptyMeasure(bpm)])}>
                    + Agregar compás
                </button>
            </div>

            <SectionActions index={index} total={total} onMove={onMove} onRemove={onRemove} />
        </div>
    );
}
