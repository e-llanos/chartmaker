'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { beatsPerMeasure } from '@/domain/music/meter';
import type { Chart } from '@/domain/chart/types';
import type { Score } from '@/domain/score/types';
import type { SongCreate, SongInput } from '@/domain/song/types';
import { computeBadges, SECTION_TYPES } from '@/domain/sections/section-types';
import {
    transposeChordString,
    convertChordString,
    semitoneDistance,
} from '@/domain/music/engine';
import ViewerToolbar, { type SectionsLayout } from '@/shared/viewer/ViewerToolbar';
import SectionNav from '@/shared/viewer/SectionNav';
import SectionCard from '@/shared/viewer/SectionCard';
import SongHeader from '@/shared/viewer/SongHeader';
import ExportMenu from '@/shared/export/ExportMenu';
import ExportHead from '@/shared/export/ExportHead';
import { useViewerSettings, type ViewerSettings } from '@/shared/viewer/useViewerSettings';
import MeasureBox from '@/features/chart/components/MeasureBox';

interface ChartViewerProps {
    song: SongInput;
    chart: Chart;
    score?: Score;
    settings?: ViewerSettings;
    editHref?: string;
    hideHeader?: boolean;
}

export default function ChartViewer({ song, chart, score, settings, editHref, hideHeader = false }: ChartViewerProps) {
    const local = useViewerSettings();
    const { semitones, setSemitones, notation, setNotation } = settings ?? local;
    const [layout, setLayout] = useState<SectionsLayout>('list');
    const [highlighted, setHighlighted] = useState<string | null>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
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

    const exportSong = useMemo<SongCreate>(
        () => ({ ...song, chart, ...(score ? { score } : {}) }),
        [song, chart, score]
    );

    return (
        <div className="viewer">
            {!hideHeader && <SongHeader title={song.title} meta={song} />}
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
