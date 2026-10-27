'use client';

import { useState } from 'react';
import { beatsPerMeasure, chartFromChordPro } from '@/lib/chart/chart.utils';
import type { Chart } from '@/lib/chart/chart.types';
import type { SongInput } from '@/lib/data/song.types';
import type { Score, ScoreSection } from '@/lib/score/score.types';
import { newScoreSection, scoreFromChart } from '@/lib/score/score.utils';
import { nextLabel, type SectionType } from '@/lib/sections/sectionTypes';
import EditorLayout from '../shared/EditorLayout';
import SectionTypeButtons from '../shared/SectionTypeButtons';
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
    const count = beatsPerMeasure(song.compas);
    const hasBase = Boolean(baseChart?.sections.length);

    function commit(next: Score) {
        setScore(next);
        onChange?.(next);
    }

    function addSection(type: SectionType) {
        const n = score.sections.filter((s) => s.type === type).length;
        commit({ sections: [...score.sections, newScoreSection(type, nextLabel(type, n), count)] });
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
        commit(scoreFromChart(source, count));
    }

    const tools = (
        <>
            <div className="tool-group">
                <h3>Chart avanzado</h3>
                <p className="hint">
                    {song.title || 'Sin título'} · {song.key} · {song.compas} ({count} tiempos por compás).
                    Estos datos se editan en el editor de cifrado.
                </p>
                <button type="button" className="ghost-btn" onClick={generate}>
                    {hasBase ? 'Generar desde el chart simple' : 'Generar desde el cifrado'}
                </button>
            </div>

            <div className="tool-group">
                <h3>Agregar sección</h3>
                <SectionTypeButtons onAdd={addSection} />
            </div>

            <div className="tool-group">
                <h3>Secciones</h3>
                {score.sections.length === 0 ? (
                    <p className="hint">Agrega una sección o genera el chart a partir del existente.</p>
                ) : (
                    score.sections.map((s, i) => (
                        <ScoreSectionEditor
                            key={s.id}
                            section={s}
                            count={count}
                            index={i}
                            total={score.sections.length}
                            onChange={(next) => updateSection(i, next)}
                            onMove={(dir) => moveSection(i, dir)}
                            onRemove={() => commit({ sections: score.sections.filter((_, k) => k !== i) })}
                        />
                    ))
                )}
            </div>
        </>
    );

    return <EditorLayout tools={tools} preview={<ScoreViewer song={song} score={score} />} />;
}