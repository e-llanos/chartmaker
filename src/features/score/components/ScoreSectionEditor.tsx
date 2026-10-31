'use client';

import { useState } from 'react';
import { normalizeChord } from '@/domain/music/engine';
import { padBeats } from '@/domain/music/meter';
import {
    MEASURE_MARKS,
    type LeftBar,
    type MeasureMark,
    type RightBar,
    type ScoreMeasure,
    type ScoreSection,
} from '@/domain/score/types';
import { emptyScoreMeasure } from '@/domain/score/utils';
import SectionMetaFields, { SectionActions } from '@/shared/editor/SectionMetaFields';
import { ArrowLeftIcon, ArrowRightIcon, CopyIcon, PlusIcon, TrashIcon } from '@/shared/ui/Icons';
import BarIcon, { type BarIconKind } from './BarIcon';
import { MarkView, SimileIcon } from './ScoreSymbols';

const ICON_MARKS: MeasureMark[] = ['segno', 'coda', 'fermata'];
const TEXT_MARKS: MeasureMark[] = ['toCoda', 'dc', 'ds', 'dcCoda', 'dsCoda', 'fine'];
const PER_ROW_CHOICES: number[] = [2, 4, 6, 8];

const LEFT_OPTIONS: Array<{ value: LeftBar | undefined; icon: BarIconKind; label: string }> = [
    { value: undefined, icon: 'single', label: 'Barra simple' },
    { value: 'double', icon: 'double', label: 'Barra doble' },
    { value: 'repeat', icon: 'repeat-start', label: 'Repetición |:' },
];

const RIGHT_OPTIONS: Array<{ value: RightBar | undefined; icon: BarIconKind; label: string }> = [
    { value: undefined, icon: 'single', label: 'Barra simple' },
    { value: 'double', icon: 'double', label: 'Barra doble' },
    { value: 'repeat', icon: 'repeat-end', label: 'Repetición :|' },
    { value: 'final', icon: 'final', label: 'Barra final' },
];

const leftGlyph = (m: ScoreMeasure) => (m.left === 'repeat' ? '|:' : m.left === 'double' ? '‖' : '|');
const rightGlyph = (m: ScoreMeasure) =>
    m.right === 'repeat' ? ':|' : m.right === 'double' ? '‖' : m.right === 'final' ? '|]' : '|';

interface MeasureTileProps {
    measure: ScoreMeasure;
    count: number;
    index: number;
    selected: boolean;
    onSelect: () => void;
}

/** Vista reducida de un compás en la tira: barras, acordes por tiempo y casilla. */
function MeasureTile({ measure, count, index, selected, onSelect }: MeasureTileProps) {
    const beats = padBeats(measure.beats, count);
    return (
        <div className="tile-wrap">
            <span className={`tile-volta${measure.ending ? '' : ' empty'}`}>
                {measure.ending ? `${measure.ending}.` : ''}
            </span>
            <button type="button" className="tile" aria-pressed={selected}
                aria-label={`Compás ${index + 1}`} onClick={onSelect}>
                <span className="tile-bar">{leftGlyph(measure)}</span>
                <span className="tile-chords">
                    {measure.simile
                        ? '%'
                        : beats.map((b, i) => (
                            <span key={i} className={b.trim() ? undefined : 'dim'}>{b.trim() || '/'}</span>
                        ))}
                </span>
                <span className="tile-bar">{rightGlyph(measure)}</span>
                {(measure.marks?.length || measure.note) ? <i className="tile-dot" /> : null}
            </button>
        </div>
    );
}

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
    const [selected, setSelected] = useState<number>(0);
    const sel = Math.min(selected, section.measures.length - 1);
    const m = section.measures[sel];

    // Si una canción antigua tiene otro valor (3, 5…), se muestra además de las cuatro opciones
    const rowChoices = PER_ROW_CHOICES.includes(section.perRow)
        ? PER_ROW_CHOICES
        : [...PER_ROW_CHOICES, section.perRow].sort((a, b) => a - b);

    const patch = (changes: Partial<ScoreSection>) => onChange({ ...section, ...changes });
    const setMeasures = (measures: ScoreMeasure[]) => patch({ measures });
    const patchMeasure = (j: number, changes: Partial<ScoreMeasure>) =>
        setMeasures(section.measures.map((x, i) => (i === j ? { ...x, ...changes } : x)));

    function setBeat(j: number, b: number, value: string) {
        const measure = section.measures[j];
        if (!measure) return;
        const beats = padBeats(measure.beats, Math.max(count, measure.beats.length));
        beats[b] = value;
        patchMeasure(j, { beats });
    }

    function toggleMark(j: number, mark: MeasureMark) {
        const marks = section.measures[j]?.marks ?? [];
        patchMeasure(j, { marks: marks.includes(mark) ? marks.filter((x) => x !== mark) : [...marks, mark] });
    }

    function addMeasure() {
        setMeasures([...section.measures, emptyScoreMeasure(count)]);
        setSelected(section.measures.length);
    }

    function duplicate(j: number) {
        const measure = section.measures[j];
        if (!measure) return;
        const copy: ScoreMeasure = {
            ...measure,
            beats: [...measure.beats],
            ...(measure.marks ? { marks: [...measure.marks] } : {}),
        };
        setMeasures([...section.measures.slice(0, j + 1), copy, ...section.measures.slice(j + 1)]);
        setSelected(j + 1);
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
        setSelected(t);
    }

    function removeMeasure(j: number) {
        setMeasures(section.measures.filter((_, i) => i !== j));
        setSelected(Math.max(0, j - 1));
    }

    return (
        <div className="section-editor">
            <SectionMetaFields
                section={section}
                onChange={patch}
                notePlaceholder="Anotación (ej. pop ballad)"
                repeatIcon={false}
            />

            <div className="inspector-field">
                <span className="lb">Por fila</span>
                <div className="seg">
                    {rowChoices.map((n) => (
                        <button key={n} type="button" aria-pressed={section.perRow === n}
                            onClick={() => patch({ perRow: n })}>{n}</button>
                    ))}
                </div>
            </div>

            <span className="lb">Compases · toca uno para editarlo</span>
            <div className="strip">
                {section.measures.map((measure, j) => (
                    <MeasureTile key={j} measure={measure} count={count} index={j}
                        selected={j === sel} onSelect={() => setSelected(j)} />
                ))}
                <div className="tile-wrap">
                    <span className="tile-volta empty" />
                    <button type="button" className="tile-add" aria-label="Agregar compás"
                        title="Agregar compás" onClick={addMeasure}><PlusIcon /></button>
                </div>
            </div>

            {m && (
                <div className="inspector">
                    <div className="inspector-head">
                        <strong>Compás {sel + 1}</strong>
                        <button type="button" className="ed-btn mini" disabled={sel === 0}
                            aria-label="Mover a la izquierda" title="Mover a la izquierda"
                            onClick={() => moveMeasure(sel, -1)}><ArrowLeftIcon /></button>
                        <button type="button" className="ed-btn mini" disabled={sel === section.measures.length - 1}
                            aria-label="Mover a la derecha" title="Mover a la derecha"
                            onClick={() => moveMeasure(sel, 1)}><ArrowRightIcon /></button>
                        <button type="button" className="ed-btn mini" aria-label="Duplicar compás"
                            title="Duplicar compás" onClick={() => duplicate(sel)}><CopyIcon /></button>
                        <button type="button" className="ed-btn mini danger" aria-label="Eliminar compás"
                            title="Eliminar compás" onClick={() => removeMeasure(sel)}><TrashIcon /></button>
                    </div>

                    <div className="inspector-field">
                        <span className="lb">Tiempos</span>
                        <div className="measure-beats"
                            style={{ gridTemplateColumns: `repeat(${Math.max(count, m.beats.length)}, 1fr)` }}>
                            {padBeats(m.beats, count).map((beat, b) => (
                                <input
                                    key={b}
                                    className="beat-input"
                                    value={beat}
                                    disabled={Boolean(m.simile)}
                                    placeholder={String(b + 1)}
                                    aria-label={`Compás ${sel + 1}, tiempo ${b + 1}`}
                                    onChange={(e) => setBeat(sel, b, e.target.value)}
                                    onBlur={(e) => {
                                        const clean = normalizeChord(e.target.value.trim());
                                        if (clean !== beat) setBeat(sel, b, clean);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bars-row">
                        <div className="ed-group">
                            <span className="lb">Inicio</span>
                            <div className="ed-group-row">
                                {LEFT_OPTIONS.map((o) => (
                                    <button key={o.label} type="button" className="ed-btn"
                                        aria-pressed={m.left === o.value} aria-label={o.label} title={o.label}
                                        onClick={() => patchMeasure(sel, { left: o.value })}>
                                        <BarIcon kind={o.icon} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <span className="ed-divider" />
                        <div className="ed-group">
                            <span className="lb">Fin</span>
                            <div className="ed-group-row">
                                {RIGHT_OPTIONS.map((o) => (
                                    <button key={o.label} type="button" className="ed-btn"
                                        aria-pressed={m.right === o.value} aria-label={o.label} title={o.label}
                                        onClick={() => patchMeasure(sel, { right: o.value })}>
                                        <BarIcon kind={o.icon} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="ed-group">
                        <span className="lb">Casilla</span>
                        <div className="ed-group-row">
                            {([1, 2, 3] as const).map((n) => (
                                <button key={n} type="button" className="ed-btn"
                                    aria-pressed={m.ending === n}
                                    aria-label={`Casilla ${n} (otra vez para quitarla)`}
                                    title={`Casilla ${n}`}
                                    onClick={() => patchMeasure(sel, { ending: m.ending === n ? undefined : n })}>
                                    {n}.
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="ed-group">
                        <span className="lb">Símbolos</span>
                        <div className="mark-grid">
                            {ICON_MARKS.map((k) => (
                                <button key={k} type="button" className="ed-btn mark-btn"
                                    aria-pressed={m.marks?.includes(k) ?? false}
                                    aria-label={MEASURE_MARKS[k]} title={MEASURE_MARKS[k]}
                                    onClick={() => toggleMark(sel, k)}>
                                    <MarkView mark={k} />
                                </button>
                            ))}
                            <button type="button" className="ed-btn mark-btn" aria-pressed={Boolean(m.simile)}
                                aria-label="Repetir el compás anterior" title="Repetir el compás anterior"
                                onClick={() => patchMeasure(sel, { simile: m.simile ? undefined : true })}>
                                <SimileIcon />
                            </button>
                            {TEXT_MARKS.map((k) => (
                                <button key={k} type="button" className="ed-btn text mark-chip"
                                    aria-pressed={m.marks?.includes(k) ?? false}
                                    onClick={() => toggleMark(sel, k)}>
                                    {MEASURE_MARKS[k]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <input className="tool-input" value={m.note ?? ''} placeholder="Nota del compás (opcional)"
                        aria-label={`Nota del compás ${sel + 1}`}
                        onChange={(e) => patchMeasure(sel, { note: e.target.value || undefined })} />
                </div>
            )}

            <SectionActions index={index} total={total} onMove={onMove} onRemove={onRemove} />
        </div>
    );
}