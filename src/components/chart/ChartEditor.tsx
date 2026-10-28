'use client';

import { useState } from 'react';
import { chartFromChordPro, newSection } from '@/domain/chart/utils';
import { beatsPerMeasure } from '@/domain/music/meter';
import type { Chart, ChartSection } from '@/domain/chart/types';
import type { SongInput } from '@/domain/song/types';
import { nextLabel, type SectionType } from '@/domain/sections/section-types';
import EditorLayout from '../shared/EditorLayout';
import SectionTypeButtons from '../shared/SectionTypeButtons';
import ChartViewer from './ChartViewer';
import SectionEditor from './SectionEditor';

interface ChartEditorProps {
    song: SongInput;
    initial: Chart;
    onChange?: (chart: Chart) => void;
}

export default function ChartEditor({ song, initial, onChange }: ChartEditorProps) {
    const [chart, setChart] = useState<Chart>(initial);
    const bpm = beatsPerMeasure(song.compas);

    function commit(next: Chart) {
        setChart(next);
        onChange?.(next);
    }

    function addSection(type: SectionType) {
        const count = chart.sections.filter((s) => s.type === type).length;
        commit({ sections: [...chart.sections, newSection(type, nextLabel(type, count), bpm)] });
    }

    function updateSection(index: number, next: ChartSection) {
        commit({ sections: chart.sections.map((s, i) => (i === index ? next : s)) });
    }

    function moveSection(index: number, dir: -1 | 1) {
        const target = index + dir;
        if (target < 0 || target >= chart.sections.length) return;
        const sections = [...chart.sections];
        const a = sections[index];
        const b = sections[target];
        if (!a || !b) return;
        sections[index] = b;
        sections[target] = a;
        commit({ sections });
    }

    function removeSection(index: number) {
        commit({ sections: chart.sections.filter((_, i) => i !== index) });
    }

    function generate() {
        if (chart.sections.length > 0 && !window.confirm('Esto reemplazará el chart actual. ¿Continuar?')) return;
        commit(chartFromChordPro(song.body, song.compas));
    }

    const tools = (
        <>
            <div className="tool-group">
                <h3>Chart</h3>
                <p className="hint">
                    {song.title || 'Sin título'} · {song.key} · {song.compas} ({bpm} tiempos por compás).
                    Estos datos se editan en el editor de cifrado.
                </p>
                <button type="button" className="ghost-btn" onClick={generate}>
                    Generar desde el cifrado
                </button>
            </div>

            <div className="tool-group">
                <h3>Agregar sección</h3>
                <SectionTypeButtons onAdd={addSection} />
            </div>

            <div className="tool-group">
                <h3>Secciones</h3>
                {chart.sections.length === 0 ? (
                    <p className="hint">Agrega una sección o genera el chart desde el cifrado.</p>
                ) : (
                    chart.sections.map((s, i) => (
                        <SectionEditor
                            key={s.id}
                            section={s}
                            bpm={bpm}
                            index={i}
                            total={chart.sections.length}
                            onChange={(next) => updateSection(i, next)}
                            onMove={(dir) => moveSection(i, dir)}
                            onRemove={() => removeSection(i)}
                        />
                    ))
                )}
            </div>
        </>
    );

    return <EditorLayout tools={tools} preview={<ChartViewer song={song} chart={chart} />} />;
}