'use client';

import { useMemo, useState } from 'react';
import { CHART_STYLE_LABELS, type Chart, type ChartStyle } from '@/domain/chart/types';
import { timeSignature } from '@/domain/chart/utils';
import { beatsPerMeasure } from '@/domain/music/core/meter';
import { computeBadges, SECTION_TYPES } from '@/domain/sections/section-types';
import type { SongCreate, SongInput } from '@/domain/song/types';
import SectionCard from '@/shared/viewer/SectionCard';
import SongHeader from '@/shared/viewer/SongHeader';
import { useChordMapper, useResolvedSettings } from '@/shared/viewer/useChordMapper';
import type { ViewerSettings } from '@/shared/viewer/useViewerSettings';
import ViewerFrame from '@/shared/viewer/ViewerFrame';
import type { SectionsLayout } from '@/shared/viewer/ViewerToolbar';
import AdvancedSection from './AdvancedSection';
import MeasureBox from './MeasureBox';

interface ChartViewerProps {
    song: SongInput;
    chart: Chart;
    /** Fuerza el estilo (lo usa el editor). Si se omite, el visor ofrece un selector temporal. */
    style?: ChartStyle;
    /** Ajustes compartidos entre pestañas; si se omite, el visor usa los suyos. */
    settings?: ViewerSettings;
    /** La cabecera la dibuja el contenedor de la canción. */
    hideHeader?: boolean;
}

export default function ChartViewer({
    song, chart, style: forcedStyle, settings: sharedSettings, hideHeader = false,
}: ChartViewerProps) {
    const settings = useResolvedSettings(sharedSettings);
    const { displayKey, mapChord } = useChordMapper(song.key, settings);

    // El estilo guardado manda; el selector solo lo cambia mientras se mira (no se guarda).
    const [chosen, setChosen] = useState<ChartStyle | null>(null);
    const style = forcedStyle ?? chosen ?? chart.style;
    const advanced = style === 'advanced';

    const [layout, setLayout] = useState<SectionsLayout>('list');
    const [highlighted, setHighlighted] = useState<string | null>(null);

    const badges = useMemo(() => computeBadges(chart.sections), [chart.sections]);
    const count = beatsPerMeasure(song.compas);
    const time = useMemo(() => timeSignature(song.compas), [song.compas]);

    const exportSong = useMemo<SongCreate>(() => ({ ...song, chart }), [song, chart]);

    const styleControl = forcedStyle ? null : (
        <select
            value={style}
            onChange={(e) => setChosen(e.target.value as ChartStyle)}
            aria-label="Estilo del chart"
            title="Cómo se muestra el chart (no se guarda)"
        >
            {(Object.keys(CHART_STYLE_LABELS) as ChartStyle[]).map((s) => (
                <option key={s} value={s}>Estilo {CHART_STYLE_LABELS[s].toLowerCase()}</option>
            ))}
        </select>
    );

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
            navScope={advanced ? 'score' : 'chart'}
            layout={advanced ? undefined : layout}
            onLayoutChange={advanced ? undefined : setLayout}
            controls={styleControl}
            isEmpty={chart.sections.length === 0}
            emptyMessage="Este chart está vacío."
        >
            {advanced ? (
                <div className="score">
                    {chart.sections.map((s, i) => (
                        <AdvancedSection
                            key={s.id}
                            section={s}
                            first={i === 0}
                            count={count}
                            time={time}
                            mapChord={mapChord}
                        />
                    ))}
                </div>
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
        </ViewerFrame>
    );
}