'use client';

import { useState } from 'react';
import type { Chart, ChartSection, ChartStyle } from '@/domain/chart/types';
import { chartFromChordPro, newSection } from '@/domain/chart/utils';
import { beatsPerMeasure } from '@/domain/music/core/meter';
import { computeBadges, nextLabel, SECTION_TYPES, type SectionType } from '@/domain/sections/section-types';
import type { SongInput } from '@/domain/song/types';
import EditorLayout from '@/shared/editor/EditorLayout';
import SectionPanel, { sectionSummary } from '@/shared/editor/SectionPanel';
import SectionsToolbar from '@/shared/editor/SectionsToolbar';
import SectionTypeButtons from '@/shared/editor/SectionTypeButtons';
import { useAccordion } from '@/shared/editor/useAccordion';
import { useReorder } from '@/shared/editor/useReorder';
import AdvancedSectionEditor from './AdvancedSectionEditor';
import ChartViewer from './ChartViewer';
import SectionEditor from './SectionEditor';

interface ChartEditorProps {
    /** Datos de la canción (solo lectura: se editan en el editor de cifrado). */
    song: SongInput;
    initial: Chart;
    onChange?: (chart: Chart) => void;
}

export default function ChartEditor({ song, initial, onChange }: ChartEditorProps) {
    const [chart, setChart] = useState<Chart>(initial);
    const accordion = useAccordion(initial.sections[0] ? [initial.sections[0].id] : []);
    const reorder = useReorder(chart.sections, (sections) => commitSections(sections));

    const advanced = chart.style === 'advanced';
    const count = beatsPerMeasure(song.compas);
    const badges = computeBadges(chart.sections);
    const totalMeasures = chart.sections.reduce((sum, s) => sum + s.measures.length, 0);

    function commit(next: Chart) {
        setChart(next);
        onChange?.(next);
    }

    /** Cambia las secciones conservando el resto del chart (el estilo). */
    function commitSections(sections: ChartSection[]) {
        commit({ ...chart, sections });
    }

    /** Cambiar de estilo no borra nada: los campos avanzados se conservan aunque estén ocultos. */
    function setStyle(style: ChartStyle) {
        commit({ ...chart, style });
    }

    function addSection(type: SectionType) {
        const n = chart.sections.filter((s) => s.type === type).length;
        const section = newSection(type, nextLabel(type, n), count);
        commitSections([...chart.sections, section]);
        accordion.show(section.id);
    }

    function updateSection(index: number, next: ChartSection) {
        commitSections(chart.sections.map((s, i) => (i === index ? next : s)));
    }

    function moveSection(index: number, dir: -1 | 1) {
        const target = index + dir;
        const a = chart.sections[index];
        const b = chart.sections[target];
        if (!a || !b) return;
        const sections = [...chart.sections];
        sections[index] = b;
        sections[target] = a;
        commitSections(sections);
    }

    function generate() {
        if (chart.sections.length > 0 && !window.confirm('Esto reemplazará el chart actual. ¿Continuar?')) return;
        const next = chartFromChordPro(song.body, song.compas, chart.style);
        commit(next);
        accordion.set(next.sections[0] ? [next.sections[0].id] : []);
    }

    const tools = (
        <>
            <SectionsToolbar
                subtitle={`${chart.sections.length} secciones · ${totalMeasures} compases`}
                generateLabel="Generar desde el cifrado"
                onCollapseAll={accordion.collapseAll}
                onExpandAll={() => accordion.set(chart.sections.map((s) => s.id))}
                onGenerate={generate}
            />

            <label className="editor-style">
                <input
                    type="checkbox"
                    checked={advanced}
                    onChange={(e) => setStyle(e.target.checked ? 'advanced' : 'simple')}
                />
                <span>Herramientas avanzadas</span>
                <small className="editor-style-note">
                    Barras de repetición, casillas, símbolos y compases por fila. Al desactivarlas no se pierde nada.
                </small>
            </label>

            <div className="add-row">
                <span className="lb">Agregar</span>
                <SectionTypeButtons compact onAdd={addSection} />
            </div>

            {chart.sections.length === 0 ? (
                <p className="hint">Agrega una sección o genera el chart desde el cifrado.</p>
            ) : (
                <div className="acc-list">
                    {chart.sections.map((s, i) => {
                        const open = accordion.isOpen(s.id);
                        return (
                            <SectionPanel
                                key={s.id}
                                badge={badges[i]}
                                title={s.label || SECTION_TYPES[s.type].label}
                                summary={sectionSummary(
                                    s.measures.length,
                                    s.repeat,
                                    s.note,
                                    { showRepeat: open, ...(advanced && open ? { perRow: s.perRow } : {}) },
                                )}
                                open={open}
                                onToggle={() => accordion.toggle(s.id)}
                                drag={reorder.props(i)}
                            >
                                {advanced ? (
                                    <AdvancedSectionEditor
                                        section={s}
                                        count={count}
                                        index={i}
                                        total={chart.sections.length}
                                        onChange={(next) => updateSection(i, next)}
                                        onMove={(dir) => moveSection(i, dir)}
                                        onRemove={() => commitSections(chart.sections.filter((_, k) => k !== i))}
                                    />
                                ) : (
                                    <SectionEditor
                                        section={s}
                                        bpm={count}
                                        index={i}
                                        total={chart.sections.length}
                                        onChange={(next) => updateSection(i, next)}
                                        onMove={(dir) => moveSection(i, dir)}
                                        onRemove={() => commitSections(chart.sections.filter((_, k) => k !== i))}
                                    />
                                )}
                            </SectionPanel>
                        );
                    })}
                </div>
            )}
        </>
    );

    return <EditorLayout tools={tools} preview={<ChartViewer song={song} chart={chart} style={chart.style} />} />;
}