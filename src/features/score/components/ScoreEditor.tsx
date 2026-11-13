'use client';

import { useState } from 'react';
import type { Chart, ChartSection } from '@/domain/chart/types';
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
import ScoreSectionEditor from './ScoreSectionEditor';
import ScoreViewer from './ScoreViewer';

interface ScoreEditorProps {
    /** Datos de la canción (solo lectura: se editan en el editor de cifrado). */
    song: SongInput;
    initial: Chart;
    onChange?: (chart: Chart) => void;
}

export default function ScoreEditor({ song, initial, onChange }: ScoreEditorProps) {
    const [chart, setChart] = useState<Chart>(initial);
    const accordion = useAccordion(initial.sections[0] ? [initial.sections[0].id] : []);
    const reorder = useReorder(chart.sections, (sections) => commitSections(sections));

    const count = beatsPerMeasure(song.compas);
    const badges = computeBadges(chart.sections);
    const totalMeasures = chart.sections.reduce((sum, s) => sum + s.measures.length, 0);

    /** Editar con las herramientas avanzadas deja el chart en estilo avanzado. */
    function commit(next: Chart) {
        const advanced: Chart = { ...next, style: 'advanced' };
        setChart(advanced);
        onChange?.(advanced);
    }

    function commitSections(sections: ChartSection[]) {
        commit({ ...chart, sections });
    }

    function addSection(type: SectionType) {
        const n = chart.sections.filter((s) => s.type === type).length;
        const section = newSection(type, nextLabel(type, n), count);
        commitSections([...chart.sections, section]);
        accordion.show(section.id);
    }

    function updateSection(i: number, next: ChartSection) {
        commitSections(chart.sections.map((s, k) => (k === i ? next : s)));
    }

    function moveSection(i: number, dir: -1 | 1) {
        const t = i + dir;
        const a = chart.sections[i];
        const b = chart.sections[t];
        if (!a || !b) return;
        const sections = [...chart.sections];
        sections[i] = b;
        sections[t] = a;
        commitSections(sections);
    }

    function generate() {
        if (chart.sections.length > 0 && !window.confirm('Esto reemplazará el chart actual. ¿Continuar?')) return;
        const next = chartFromChordPro(song.body, song.compas, 'advanced');
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
                                    open ? { showRepeat: true, perRow: s.perRow } : {},
                                )}
                                open={open}
                                onToggle={() => accordion.toggle(s.id)}
                                drag={reorder.props(i)}
                            >
                                <ScoreSectionEditor
                                    section={s}
                                    count={count}
                                    index={i}
                                    total={chart.sections.length}
                                    onChange={(next) => updateSection(i, next)}
                                    onMove={(dir) => moveSection(i, dir)}
                                    onRemove={() => commitSections(chart.sections.filter((_, k) => k !== i))}
                                />
                            </SectionPanel>
                        );
                    })}
                </div>
            )}
        </>
    );

    return <EditorLayout tools={tools} preview={<ScoreViewer song={song} score={chart} />} />;
}