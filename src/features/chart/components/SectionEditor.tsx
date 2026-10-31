'use client';

import type { ChartMeasure, ChartSection } from '@/domain/chart/types';
import { emptyMeasure } from '@/domain/chart/utils';
import { normalizeChord } from '@/domain/music/engine';
import { padBeats } from '@/domain/music/meter';
import SectionMetaFields, { SectionActions } from '@/shared/editor/SectionMetaFields';
import { CloseIcon, CopyIcon, PlusIcon, RepeatIcon } from '@/shared/ui/Icons';

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
        const current = measure.repeat ?? 1;
        const next = current >= 4 ? 1 : current + 1;
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

    return (
        <div className="section-editor">
            <SectionMetaFields section={section} onChange={patch} notePlaceholder="Anotación (ej. Pad & Piano)" />

            <span className="lb">Compases</span>
            <div className="measure-cards">
                {section.measures.map((m, j) => {
                    const repeat = m.repeat ?? 1;
                    const beats = padBeats(m.beats, bpm);
                    return (
                        <div className="measure-card" key={j}>
                            <div className="measure-card-head">
                                <span className="measure-num">{j + 1}</span>
                                <button type="button" className="ed-btn mini" aria-pressed={repeat > 1}
                                    aria-label={`Repetir compás ${j + 1}`}
                                    title={repeat > 1 ? `Repetido ×${repeat} (clic para cambiar)` : 'Repetir compás'}
                                    onClick={() => cycleRepeat(j)}>
                                    <RepeatIcon />{repeat > 1 && <span>×{repeat}</span>}
                                </button>
                                <button type="button" className="ed-btn mini" aria-label={`Duplicar compás ${j + 1}`}
                                    title="Duplicar compás" onClick={() => duplicate(j)}><CopyIcon /></button>
                                <button type="button" className="ed-btn mini danger" aria-label={`Eliminar compás ${j + 1}`}
                                    title="Eliminar compás"
                                    onClick={() => setMeasures(section.measures.filter((_, i) => i !== j))}>
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="measure-beats" style={{ gridTemplateColumns: `repeat(${beats.length}, 1fr)` }}>
                                {beats.map((beat, b) => (
                                    <input
                                        key={b}
                                        className="beat-input"
                                        value={beat}
                                        placeholder={String(b + 1)}
                                        aria-label={`Compás ${j + 1}, tiempo ${b + 1}`}
                                        onChange={(e) => setBeat(j, b, e.target.value)}
                                        onBlur={(e) => {
                                            const clean = normalizeChord(e.target.value.trim());
                                            if (clean !== beat) setBeat(j, b, clean);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
                <button type="button" className="measure-add"
                    onClick={() => setMeasures([...section.measures, emptyMeasure(bpm)])}>
                    <PlusIcon /> Compás
                </button>
            </div>

            <SectionActions index={index} total={total} onMove={onMove} onRemove={onRemove} />
        </div>
    );
}