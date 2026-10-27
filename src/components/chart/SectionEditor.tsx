'use client';

import { SECTION_TYPES, SECTION_TYPE_KEYS, type SectionType } from '@/lib/sections/sectionTypes';
import { REPEAT_MAX, REPEAT_MIN } from '@/lib/cifrado/sectionText';
import { emptyMeasure, padBeats } from '@/lib/chart/chart.utils';
import { normalizeChord } from '@/lib/music/engine';
import type { ChartMeasure, ChartSection } from '@/lib/chart/chart.types';

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

    function cycleRepeat(m: number) {
        const measure = section.measures[m];
        if (!measure) return;
        const current = measure.repeat ?? 1;
        const next = current >= 4 ? 1 : current + 1;
        const { repeat: _old, ...rest } = measure;
        setMeasures(section.measures.map((x, i) => (i === m ? (next > 1 ? { ...rest, repeat: next } : rest) : x)));
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
            <div className="tool-row">
                <select className="tool-select" value={section.type} aria-label="Tipo de sección"
                    onChange={(e) => patch({ type: e.target.value as SectionType })}>
                    {SECTION_TYPE_KEYS.map((t) => (
                        <option key={t} value={t}>{SECTION_TYPES[t].label}</option>
                    ))}
                </select>
                <input className="tool-input" value={section.label} placeholder="Nombre (ej. Verso 1)"
                    aria-label="Nombre de la sección" onChange={(e) => patch({ label: e.target.value })} />
            </div>

            <input className="tool-input" value={section.note} placeholder="Anotación (ej. Pad & Piano)"
                aria-label="Anotación" onChange={(e) => patch({ note: e.target.value })} />

            <div className="tool-row">
                <span className="tool-label">Repeticiones</span>
                <div className="stepper">
                    <button type="button" className="ghost-btn" aria-label="Menos repeticiones"
                        disabled={section.repeat <= REPEAT_MIN}
                        onClick={() => patch({ repeat: section.repeat - 1 })}>−</button>
                    <output className="stepper-value">×{section.repeat}</output>
                    <button type="button" className="ghost-btn" aria-label="Más repeticiones"
                        disabled={section.repeat >= REPEAT_MAX}
                        onClick={() => patch({ repeat: section.repeat + 1 })}>+</button>
                </div>
            </div>

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

            <div className="tool-row section-editor-actions">
                <button type="button" className="ghost-btn" aria-label="Subir sección"
                    disabled={index === 0} onClick={() => onMove(-1)}>↑</button>
                <button type="button" className="ghost-btn" aria-label="Bajar sección"
                    disabled={index === total - 1} onClick={() => onMove(1)}>↓</button>
                <button type="button" className="ghost-btn danger" onClick={onRemove}>Eliminar sección</button>
            </div>
        </div>
    );
}