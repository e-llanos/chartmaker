'use client';

import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react';
import { beatsPerMeasure } from '@/domain/music/meter';
import type { Chart } from '@/domain/chart/types';
import type { SongCreate, SongInput } from '@/domain/song/types';
import type { Score } from '@/domain/score/types';
import { chunk, timeSignature } from '@/domain/score/utils';
import { computeBadges, SECTION_TYPES } from '@/domain/sections/section-types';
import {
    transposeChordString,
    convertChordString,
    semitoneDistance,
} from '@/domain/music/engine';
import ViewerToolbar from '../shared/ViewerToolbar';
import SectionNav from '../shared/SectionNav';
import SongHeader from '../shared/SongHeader';
import ExportMenu from '../shared/ExportMenu';
import ExportHead from '../shared/ExportHead';
import { useViewerSettings, type ViewerSettings } from '../shared/useViewerSettings';
import ScoreRow from './ScoreRow';

interface ScoreViewerProps {
    song: SongInput;
    score: Score;
    chart?: Chart;
    settings?: ViewerSettings;
    editHref?: string;
    hideHeader?: boolean;
}

export default function ScoreViewer({ song, score, chart, settings, editHref, hideHeader }: ScoreViewerProps) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const local = useViewerSettings();
    const { semitones, setSemitones, notation, setNotation } = settings ?? local;
    const badges = useMemo(() => computeBadges(score.sections), [score.sections]);
    const count = beatsPerMeasure(song.compas);
    const time = useMemo(() => timeSignature(song.compas), [song.compas]);
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
        () => ({ ...song, ...(chart ? { chart } : {}), score }),
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
                onTranspose={(d: number) => setSemitones((s) => s + d)}
                onKeyChange={(k: string) => setSemitones(semitoneDistance(song.key, k))}
                onNotationChange={setNotation}
                actions={<ExportMenu sheetRef={sheetRef} song={exportSong} />}
            />
            <SectionNav badges={badges} scopeId="score" />

            <div ref={sheetRef} className="viewer-sheet">
                <ExportHead song={song} displayKey={displayKey} notation={notation} />

                {score.sections.length === 0 ? (
                    <p className="empty-state">
                        Este chart avanzado está vacío.{editHref && ' Usa el botón de editar para crearlo.'}
                    </p>
                ) : (
                    <div className="score">
                        {score.sections.map((s, si) => (
                            <section
                                key={s.id}
                                id={`score-${s.id}`}
                                data-export-block
                                className="score-section"
                                style={{ '--c': SECTION_TYPES[s.type].color } as CSSProperties}
                            >
                                {(() => {
                                    const rows = chunk(s.measures, s.perRow);
                                    const head = (
                                        <div className="score-head">
                                            <span className="score-label">{s.label || SECTION_TYPES[s.type].label}</span>
                                            {s.repeat > 1 && <span className="score-repeat">×{s.repeat}</span>}
                                            {s.note && <span className="score-note">{s.note}</span>}
                                        </div>
                                    );
                                    const renderRow = (row: typeof s.measures, ri: number) => (
                                        <ScoreRow
                                            key={ri}
                                            measures={row}
                                            perRow={s.perRow}
                                            count={count}
                                            mapChord={mapChord}
                                            time={si === 0 && ri === 0 ? time : null}
                                        />
                                    );

                                    if (rows.length === 0) {
                                        return (
                                            <>
                                                {head}
                                                <p className="line-comment score-empty">Sin compases.</p>
                                            </>
                                        );
                                    }
                                    return (
                                        <>
                                            <div data-export-block="row">
                                                {head}
                                                {renderRow(rows[0] ?? [], 0)}
                                            </div>
                                            {rows.slice(1).map((row, k) => renderRow(row, k + 1))}
                                        </>
                                    );
                                })()}
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}