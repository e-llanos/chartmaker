'use client';

import { useState } from 'react';
import type { Chart } from '@/domain/chart/types';
import { chartFromChordPro } from '@/domain/chart/utils';
import { beatsPerMeasure } from '@/domain/music/meter';
import type { Score, ScoreSection } from '@/domain/score/types';
import { newScoreSection, scoreFromChart } from '@/domain/score/utils';
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
    initial: Score;
    /** Chart simple existente, para usarlo como punto de partida. */
    baseChart?: Chart;
    onChange?: (score: Score) => void;
}

export default function ScoreEditor({ song, initial, baseChart, onChange }: ScoreEditorProps) {
    const [score, setScore] = useState<Score>(initial);
    const accordion = useAccordion(initial.sections[0] ? [initial.sections[0].id] : []);
    const reorder = useReorder(score.sections, (sections) => commit({ sections }));

    const count = beatsPerMeasure(song.compas);
    const badges = computeBadges(score.sections);
    const hasBase = Boolean(baseChart?.sections.length);
    const totalMeasures = score.sections.reduce((sum, s) => sum + s.measures.length, 0);

    function commit(next: Score) {
        setScore(next);
        onChange?.(next);
    }

    function addSection(type: SectionType) {
        const n = score.sections.filter((s) => s.type === type).length;
        const section = newScoreSection(type, nextLabel(type, n), count);
        commit({ sections: [...score.sections, section] });
        accordion.show(section.id);
    }

    function updateSection(i: number, next: ScoreSection) {
        commit({ sections: score.sections.map((s, k) => (k === i ? next : s)) });
    }

    function moveSection(i: number, dir: -1 | 1) {
        const t = i + dir;
        const a = score.sections[i];
        const b = score.sections[t];
        if (!a || !b) return;
        const sections = [...score.sections];
        sections[i] = b;
        sections[t] = a;
        commit({ sections });
    }

    function generate() {
        if (score.sections.length > 0 && !window.confirm('Esto reemplazará el chart avanzado actual. ¿Continuar?')) return;
        const source = hasBase && baseChart ? baseChart : chartFromChordPro(song.body, song.compas);
        const next = scoreFromChart(source, count);
        commit(next);
        accordion.set(next.sections[0] ? [next.sections[0].id] : []);
    }

    const tools = (
        <>
            <SectionsToolbar
                subtitle={`${score.sections.length} secciones · ${totalMeasures} compases`}
                generateLabel={hasBase ? 'Generar desde el chart simple' : 'Generar desde el cifrado'}
                onCollapseAll={accordion.collapseAll}
                onExpandAll={() => accordion.set(score.sections.map((s) => s.id))}
                onGenerate={generate}
            />

            <div className="add-row">
                <span className="lb">Agregar</span>
                <SectionTypeButtons compact onAdd={addSection} />
            </div>

            {score.sections.length === 0 ? (
                <p className="hint">Agrega una sección o genera el chart a partir del existente.</p>
            ) : (
                <div className="acc-list">
                    {score.sections.map((s, i) => {
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
                                    total={score.sections.length}
                                    onChange={(next) => updateSection(i, next)}
                                    onMove={(dir) => moveSection(i, dir)}
                                    onRemove={() => commit({ sections: score.sections.filter((_, k) => k !== i) })}
                                />
                            </SectionPanel>
                        );
                    })}
                </div>
            )}
        </>
    );

    return <EditorLayout tools={tools} preview={<ScoreViewer song={song} score={score} />} />;
}