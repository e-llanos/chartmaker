'use client';

import { useState } from 'react';
import type { Chart, ChartSection } from '@/domain/chart/types';
import { chartFromChordPro, newSection } from '@/domain/chart/utils';
import { beatsPerMeasure } from '@/domain/music/meter';
import { computeBadges, nextLabel, SECTION_TYPES, type SectionType } from '@/domain/sections/section-types';
import type { SongInput } from '@/domain/song/types';
import EditorLayout from '@/shared/editor/EditorLayout';
import SectionPanel, { sectionSummary } from '@/shared/editor/SectionPanel';
import SectionsToolbar from '@/shared/editor/SectionsToolbar';
import SectionTypeButtons from '@/shared/editor/SectionTypeButtons';
import { useAccordion } from '@/shared/editor/useAccordion';
import { useReorder } from '@/shared/editor/useReorder';
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
    const reorder = useReorder(chart.sections, (sections) => commit({ sections }));

    const bpm = beatsPerMeasure(song.compas);
    const badges = computeBadges(chart.sections);
    const totalMeasures = chart.sections.reduce((sum, s) => sum + s.measures.length, 0);

    function commit(next: Chart) {
        setChart(next);
        onChange?.(next);
    }

    function addSection(type: SectionType) {
        const count = chart.sections.filter((s) => s.type === type).length;
        const section = newSection(type, nextLabel(type, count), bpm);
        commit({ sections: [...chart.sections, section] });
        accordion.show(section.id);
    }

    function updateSection(index: number, next: ChartSection) {
        commit({ sections: chart.sections.map((s, i) => (i === index ? next : s)) });
    }

    function moveSection(index: number, dir: -1 | 1) {
        const target = index + dir;
        const a = chart.sections[index];
        const b = chart.sections[target];
        if (!a || !b) return;
        const sections = [...chart.sections];
        sections[index] = b;
        sections[target] = a;
        commit({ sections });
    }

    function generate() {
        if (chart.sections.length > 0 && !window.confirm('Esto reemplazará el chart actual. ¿Continuar?')) return;
        const next = chartFromChordPro(song.body, song.compas);
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
                                summary={sectionSummary(s.measures.length, s.repeat, s.note, { showRepeat: open })}
                                open={open}
                                onToggle={() => accordion.toggle(s.id)}
                                drag={reorder.props(i)}
                            >
                                <SectionEditor
                                    section={s}
                                    bpm={bpm}
                                    index={i}
                                    total={chart.sections.length}
                                    onChange={(next) => updateSection(i, next)}
                                    onMove={(dir) => moveSection(i, dir)}
                                    onRemove={() => commit({ sections: chart.sections.filter((_, k) => k !== i) })}
                                />
                            </SectionPanel>
                        );
                    })}
                </div>
            )}
        </>
    );

    return <EditorLayout tools={tools} preview={<ChartViewer song={song} chart={chart} />} />;
}