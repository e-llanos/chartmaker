'use client';

import { normalizeChord } from '@/domain/music/engine';
import { padBeats } from '@/domain/music/meter';
import {
    MEASURE_MARKS,
    MEASURE_MARK_KEYS,
    type LeftBar,
    type MeasureMark,
    type RightBar,
    type ScoreMeasure,
    type ScoreSection,
} from '@/domain/score/types';
import { emptyScoreMeasure, PER_ROW_OPTIONS } from '@/domain/score/utils';
import SectionMetaFields, { SectionActions } from '@/shared/editor/SectionMetaFields';

interface ScoreSectionEditorProps {
    section: ScoreSection;
    /** Tiempos por compás. */
    count: number;
    index: number;
    total: number;
    onChange: (section: ScoreSection) => void;
    onMove: (dir: -1 | 1) => void;
    onRemove: () => void;
}

export default function ScoreSectionEditor({
    section, count, index, total, onChange, onMove, onRemove,
}: ScoreSectionEditorProps) {
    const patch = (changes: Partial<ScoreSection>) => onChange({ ...section, ...changes });
    const setMeasures = (measures: ScoreMeasure[]) => patch({ measures });
    const patchMeasure = (j: number, changes: Partial<ScoreMeasure>) =>
        setMeasures(section.measures.map((m, i) => (i === j ? { ...m, ...changes } : m)));

    function setBeat(j: number, b: number, value: string) {
        const m = section.measures[j];
        if (!m) return;
        const beats = padBeats(m.beats, Math.max(count, m.beats.length));
        beats[b] = value;
        patchMeasure(j, { beats });
    }

    function toggleMark(j: number, mark: MeasureMark) {
        const marks = section.measures[j]?.marks ?? [];
        patchMeasure(j, { marks: marks.includes(mark) ? marks.filter((x) => x !== mark) : [...marks, mark] });
    }

    function duplicate(j: number) {
        const m = section.measures[j];
        if (!m) return;
        const copy: ScoreMeasure = { ...m, beats: [...m.beats], ...(m.marks ? { marks: [...m.marks] } : {}) };
        setMeasures([...section.measures.slice(0, j + 1), copy, ...section.measures.slice(j + 1)]);
    }

    function moveMeasure(j: number, dir: -1 | 1) {
        const t = j + dir;
        const a = section.measures[j];
        const b = section.measures[t];
        if (!a || !b) return;
        const next = [...section.measures];
        next[j] = b;
        next[t] = a;
        setMeasures(next);
    }

    return (
        <div className="section-editor">
            <SectionMetaFields section={section} onChange={patch} notePlaceholder="Anotación (ej. pop ballad)" />

            <label className="tool-row">
                <span className="tool-label">Compases por fila</span>
                <select className="tool-select" value={section.perRow}
                    onChange={(e) => patch({ perRow: Number(e.target.value) })}>
                    {PER_ROW_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
            </label>

            <div className="score-measures">
                {section.measures.map((m, j) => (
                    <div className="score-measure-editor" key={j}>
                        <div className="score-measure-title">
                            <strong>Compás {j + 1}</strong>
                            <span className="score-measure-actions">
                                <button type="button" title="Mover a la izquierda" disabled={j === 0}
                                    onClick={() => moveMeasure(j, -1)}>←</button>
                                <button type="button" title="Mover a la derecha" disabled={j === section.measures.length - 1}
                                    onClick={() => moveMeasure(j, 1)}>→</button>
                                <button type="button" title="Duplicar compás" onClick={() => duplicate(j)}>⧉</button>
                                <button type="button" className="danger" title="Eliminar compás"
                                    onClick={() => setMeasures(section.measures.filter((_, i) => i !== j))}>✕</button>
                            </span>
                        </div>

                        <div className="measure-field-beats">
                            {padBeats(m.beats, count).map((beat, b) => (
                                <input
                                    key={b}
                                    className="beat-input"
                                    value={beat}
                                    disabled={Boolean(m.simile)}
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

                        <div className="score-measure-grid">
                            <label className="tool-field">
                                <span className="tool-label">Barra inicial</span>
                                <select className="tool-select" value={m.left ?? ''}
                                    onChange={(e) => patchMeasure(j, { left: (e.target.value || undefined) as LeftBar | undefined })}>
                                    <option value="">Simple</option>
                                    <option value="double">Doble</option>
                                    <option value="repeat">Repetición |:</option>
                                </select>
                            </label>
                            <label className="tool-field">
                                <span className="tool-label">Barra final</span>
                                <select className="tool-select" value={m.right ?? ''}
                                    onChange={(e) => patchMeasure(j, { right: (e.target.value || undefined) as RightBar | undefined })}>
                                    <option value="">Simple</option>
                                    <option value="double">Doble</option>
                                    <option value="repeat">Repetición :|</option>
                                    <option value="final">Final</option>
                                </select>
                            </label>
                            <label className="tool-field">
                                <span className="tool-label">Casilla</span>
                                <select className="tool-select" value={m.ending ?? ''}
                                    onChange={(e) => patchMeasure(j, {
                                        ending: e.target.value ? (Number(e.target.value) as 1 | 2 | 3) : undefined,
                                    })}>
                                    <option value="">Ninguna</option>
                                    <option value="1">1.</option>
                                    <option value="2">2.</option>
                                    <option value="3">3.</option>
                                </select>
                            </label>
                        </div>

                        <input className="tool-input" value={m.note ?? ''} placeholder="Nota del compás (opcional)"
                            aria-label={`Nota del compás ${j + 1}`}
                            onChange={(e) => patchMeasure(j, { note: e.target.value || undefined })} />

                        <div className="score-measure-flags">
                            <button type="button" className="chip-toggle" aria-pressed={Boolean(m.simile)}
                                title="Repetir el compás anterior"
                                onClick={() => patchMeasure(j, { simile: m.simile ? undefined : true })}>
                                % Repetir compás
                            </button>
                            <details className="marks-menu">
                                <summary>Símbolos{m.marks?.length ? ` (${m.marks.length})` : ''}</summary>
                                <div className="marks-list">
                                    {MEASURE_MARK_KEYS.map((k) => (
                                        <label key={k} className="check">
                                            <input type="checkbox" checked={m.marks?.includes(k) ?? false}
                                                onChange={() => toggleMark(j, k)} />
                                            {MEASURE_MARKS[k]}
                                        </label>
                                    ))}
                                </div>
                            </details>
                        </div>
                    </div>
                ))}
                <button type="button" className="add-measure"
                    onClick={() => setMeasures([...section.measures, emptyScoreMeasure(count)])}>
                    + Agregar compás
                </button>
            </div>

            <SectionActions index={index} total={total} onMove={onMove} onRemove={onRemove} />
        </div>
    );
}
