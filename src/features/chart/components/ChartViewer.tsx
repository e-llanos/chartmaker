'use client';

import { useMemo, useState } from 'react';
import type { Chart } from '@/domain/chart/types';
import { beatsPerMeasure } from '@/domain/music/core/meter';
import { computeBadges, SECTION_TYPES } from '@/domain/sections/section-types';
import type { SongCreate, SongInput } from '@/domain/song/types';
import SectionCard from '@/shared/viewer/SectionCard';
import SongHeader from '@/shared/viewer/SongHeader';
import { useChordMapper, useResolvedSettings } from '@/shared/viewer/useChordMapper';
import type { ViewerSettings } from '@/shared/viewer/useViewerSettings';
import ViewerFrame from '@/shared/viewer/ViewerFrame';
import type { SectionsLayout } from '@/shared/viewer/ViewerToolbar';
import MeasureBox from './MeasureBox';

interface ChartViewerProps {
    song: SongInput;
    chart: Chart;
    /** Ajustes compartidos entre pestañas; si se omite, el visor usa los suyos. */
    settings?: ViewerSettings;
    /** La cabecera la dibuja el contenedor de la canción. */
    hideHeader?: boolean;
}

export default function ChartViewer({
    song, chart, settings: sharedSettings, hideHeader = false,
}: ChartViewerProps) {
    const settings = useResolvedSettings(sharedSettings);
    const { displayKey, mapChord } = useChordMapper(song.key, settings);

    const [layout, setLayout] = useState<SectionsLayout>('list');
    const [highlighted, setHighlighted] = useState<string | null>(null);

    const badges = useMemo(() => computeBadges(chart.sections), [chart.sections]);
    const count = beatsPerMeasure(song.compas);

    const exportSong = useMemo<SongCreate>(() => ({ ...song, chart }), [song, chart]);

    return (
        <ViewerFrame
            header={hideHeader ? null : <SongHeader title={song.title} meta={song} />}
            title={song.title}
            hideTitle
            song={exportSong}
            settings={settings}
            originalKey={song.key}
            displayKey={displayKey}
            badges={badges}
            navScope="chart"
            layout={layout}
            onLayoutChange={setLayout}
            isEmpty={chart.sections.length === 0}
            emptyMessage="Este chart está vacío."
        >
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
        </ViewerFrame>
    );
}
