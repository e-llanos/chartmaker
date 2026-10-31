'use client';

import { useMemo, type CSSProperties } from 'react';
import type { Chart } from '@/domain/chart/types';
import { beatsPerMeasure } from '@/domain/music/meter';
import type { Score, ScoreMeasure, ScoreSection } from '@/domain/score/types';
import { chunk, timeSignature } from '@/domain/score/utils';
import { computeBadges, SECTION_TYPES } from '@/domain/sections/section-types';
import type { SongCreate, SongInput } from '@/domain/song/types';
import SongHeader from '@/shared/viewer/SongHeader';
import { useChordMapper, useResolvedSettings } from '@/shared/viewer/useChordMapper';
import type { ViewerSettings } from '@/shared/viewer/useViewerSettings';
import ViewerFrame from '@/shared/viewer/ViewerFrame';
import ScoreRow from './ScoreRow';

interface ScoreViewerProps {
    song: SongInput;
    score: Score;
    /** Se incluye al exportar .chartmaker para no perderlo. */
    chart?: Chart;
    /** Ajustes compartidos entre pestañas; si se omite, el visor usa los suyos. */
    settings?: ViewerSettings;
    /** La cabecera la dibuja el contenedor de la canción. */
    hideHeader?: boolean;
}

interface ScoreSectionViewProps {
    section: ScoreSection;
    /** Primera sección de la hoja: lleva el compás en el margen. */
    first: boolean;
    count: number;
    time: { num: string; den: string };
    mapChord: (chord: string) => string;
}

/** Una sección: su cabecera pegada a la primera fila, para que no queden separadas al paginar. */
function ScoreSectionView({ section: s, first, count, time, mapChord }: ScoreSectionViewProps) {
    const rows = chunk(s.measures, s.perRow);

    const head = (
        <div className="score-head">
            <span className="score-label">{s.label || SECTION_TYPES[s.type].label}</span>
            {s.repeat > 1 && <span className="score-repeat">×{s.repeat}</span>}
            {s.note && <span className="score-note">{s.note}</span>}
        </div>
    );

    const renderRow = (row: ScoreMeasure[], ri: number) => (
        <ScoreRow
            key={ri}
            measures={row}
            perRow={s.perRow}
            count={count}
            mapChord={mapChord}
            time={first && ri === 0 ? time : null}
        />
    );

    return (
        <section
            id={`score-${s.id}`}
            data-export-block
            className="score-section"
            style={{ '--c': SECTION_TYPES[s.type].color } as CSSProperties}
        >
            {rows.length === 0 ? (
                <>
                    {head}
                    <p className="line-comment score-empty">Sin compases.</p>
                </>
            ) : (
                <>
                    <div data-export-block="row">
                        {head}
                        {renderRow(rows[0] ?? [], 0)}
                    </div>
                    {rows.slice(1).map((row, k) => renderRow(row, k + 1))}
                </>
            )}
        </section>
    );
}

export default function ScoreViewer({
    song, score, chart, settings: sharedSettings, hideHeader = false,
}: ScoreViewerProps) {
    const settings = useResolvedSettings(sharedSettings);
    const { displayKey, mapChord } = useChordMapper(song.key, settings);

    const badges = useMemo(() => computeBadges(score.sections), [score.sections]);
    const count = beatsPerMeasure(song.compas);
    const time = useMemo(() => timeSignature(song.compas), [song.compas]);

    const exportSong = useMemo<SongCreate>(
        () => ({ ...song, ...(chart ? { chart } : {}), score }),
        [song, chart, score]
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
            navScope="score"
            isEmpty={score.sections.length === 0}
            emptyMessage="Este chart avanzado está vacío."
        >
            <div className="score">
                {score.sections.map((s, i) => (
                    <ScoreSectionView
                        key={s.id}
                        section={s}
                        first={i === 0}
                        count={count}
                        time={time}
                        mapChord={mapChord}
                    />
                ))}
            </div>
        </ViewerFrame>
    );
}
