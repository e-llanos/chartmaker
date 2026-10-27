'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { beatsPerMeasure } from '@/lib/chart/chart.utils';
import type { Chart } from '@/lib/chart/chart.types';
import type { SongCreate, SongInput } from '@/lib/data/song.types';
import { computeBadges, SECTION_TYPES } from '@/lib/sections/sectionTypes';
import {
    transposeChordString,
    convertChordString,
    semitoneDistance,
    formatKeyLabel,
    type Notation,
} from '@/lib/music/engine';
import ViewerToolbar, { type SectionsLayout } from '../shared/ViewerToolbar';
import SectionNav from '../shared/SectionNav';
import SectionCard from '../shared/SectionCard';
import SongHeader from '../shared/SongHeader';
import ExportMenu from '../shared/ExportMenu';
import ExportHead from '../shared/ExportHead';
import MeasureBox from './MeasureBox';

interface ChartViewerProps {
    song: SongInput;
    chart: Chart;
    editHref?: string;
}

export default function ChartViewer({ song, chart, editHref }: ChartViewerProps) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const [layout, setLayout] = useState<SectionsLayout>('list');
    const [semitones, setSemitones] = useState<number>(0);
    const [notation, setNotation] = useState<Notation>('symbol');
    const [highlighted, setHighlighted] = useState<string | null>(null);

    const badges = useMemo(() => computeBadges(chart.sections), [chart.sections]);
    const count = beatsPerMeasure(song.compas);
    const displayKey = transposeChordString(song.key, semitones, 'symbol', song.key);

    const mapChord = useCallback(
        (chord: string): string =>
            convertChordString(
                transposeChordString(chord, semitones, 'symbol', song.key),
                notation,
                displayKey
            ),
        [semitones, notation, song.key, displayKey]
    );

    const exportSong = useMemo<SongCreate>(() => ({ ...song, chart }), [song, chart]);

    return (
        <div className="viewer">
            <SongHeader title={song.title} meta={song} editHref={editHref} />
            <ViewerToolbar
                title={song.title}
                hideTitle
                currentKey={displayKey}
                notation={notation}
                layout={layout}
                onTranspose={(d: number) => setSemitones((s) => s + d)}
                onKeyChange={(k: string) => setSemitones(semitoneDistance(song.key, k))}
                onNotationChange={setNotation}
                onLayoutChange={setLayout}
                actions={<ExportMenu sheetRef={sheetRef} song={exportSong} />}
            />
            <SectionNav badges={badges} scopeId="chart" />

            <div ref={sheetRef} className="viewer-sheet">
                <ExportHead song={song} displayKey={displayKey} notation={notation} />

                {chart.sections.length === 0 ? (
                    <p className="empty-state">
                        Este chart está vacío.{editHref && ' Usa el botón de editar para crearlo.'}
                    </p>
                ) : (
                    <div className={`sections-layout sections-layout-${layout}`}>
                        {chart.sections.map((s, i) => (
                            <SectionCard
                                key={s.id}
                                domId={`chart-${s.id}`}
                                badge={badges[i]}
                                label={s.label || SECTION_TYPES[s.type].label}
                                note={s.note}
                                repeat={s.repeat}
                                highlighted={highlighted === s.id}
                                onToggleHighlight={() => setHighlighted((h) => (h === s.id ? null : s.id))}
                            >
                                {s.measures.length === 0 ? (
                                    <p className="line-comment">Sin compases.</p>
                                ) : (
                                    <div className="measures-grid">
                                        {s.measures.map((m, j) => (
                                            <MeasureBox key={j} measure={m} count={count} mapChord={mapChord} />
                                        ))}
                                    </div>
                                )}
                            </SectionCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}