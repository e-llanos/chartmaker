import { Fragment } from 'react';
import { padBeats } from '@/domain/shared/beats';
import type { ScoreMeasure } from '@/domain/score/types';
import { barBetween } from '@/domain/score/utils';
import ChordText from '@/shared/viewer/ChordText';
import { Bar, MarkView, SimileIcon } from '@/shared/notation/ScoreSymbols';

interface MeasureViewProps {
    measure: ScoreMeasure;
    /** Tiempos por compás. */
    count: number;
    mapChord: (chord: string) => string;
    /** Primer compás de una casilla de repetición dentro de la fila. */
    endingStart: boolean;
}

const LEFT_MARKS = ['segno', 'coda'];
const CENTER_MARKS = ['fermata'];

function MeasureView({ measure, count, mapChord, endingStart }: MeasureViewProps) {
    const cells = padBeats(measure.beats, count);
    const marks = measure.marks ?? [];
    const left = marks.filter((m) => LEFT_MARKS.includes(m));
    const center = marks.filter((m) => CENTER_MARKS.includes(m));
    const right = marks.filter((m) => !LEFT_MARKS.includes(m) && !CENTER_MARKS.includes(m));

    return (
        <div className={`sm${measure.ending ? ' sm-ending' : ''}`}>
            {measure.ending && (
                <span className={`sm-volta${endingStart ? ' start' : ''}`}>
                    {endingStart ? `${measure.ending}.` : ''}
                </span>
            )}

            {marks.length > 0 && (
                <div className="sm-marks">
                    <span className="sm-marks-l">{left.map((m) => <MarkView key={m} mark={m as never} />)}</span>
                    <span className="sm-marks-c">{center.map((m) => <MarkView key={m} mark={m as never} />)}</span>
                    <span className="sm-marks-r">{right.map((m) => <MarkView key={m} mark={m as never} />)}</span>
                </div>
            )}

            <div className="sm-beats" style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}>
                {measure.simile ? (
                    <span className="sm-simile" style={{ gridColumn: '1 / -1' }}><SimileIcon /></span>
                ) : (
                    cells.map((beat, i) => {
                        const chord = beat.trim();
                        return (
                            <span key={i} className={`sm-beat${chord ? '' : ' empty'}`}>
                                {chord ? <ChordText chord={mapChord(chord)} /> : <span aria-hidden="true">/</span>}
                            </span>
                        );
                    })
                )}
            </div>

            {measure.note && <div className="sm-note">{measure.note}</div>}
        </div>
    );
}

interface ScoreRowProps {
    measures: ScoreMeasure[];
    perRow: number;
    count: number;
    mapChord: (chord: string) => string;
    /** Compás en el margen izquierdo (solo en la primera fila). */
    time: { num: string; den: string } | null;
}

export default function ScoreRow({ measures, perRow, count, mapChord, time }: ScoreRowProps) {
    const ghosts = Math.max(0, perRow - measures.length);
    return (
        <div className="score-row" data-export-block="row" style={{ minWidth: `${perRow * 120 + 40}px` }}>
            <div className="score-gutter">
                {time && (
                    <span className="score-time" aria-label={`Compás ${time.num}/${time.den}`}>
                        <b>{time.num}</b>
                        <b>{time.den}</b>
                    </span>
                )}
            </div>
            <Bar kind={barBetween(undefined, measures[0])} />
            {measures.map((m, i) => (
                <Fragment key={i}>
                    <MeasureView
                        measure={m}
                        count={count}
                        mapChord={mapChord}
                        endingStart={Boolean(m.ending) && measures[i - 1]?.ending !== m.ending}
                    />
                    <Bar kind={barBetween(m, measures[i + 1])} />
                </Fragment>
            ))}
            {Array.from({ length: ghosts }, (_, i) => (
                <span key={`g${i}`} className="sm-ghost" aria-hidden="true" />
            ))}
        </div>
    );
}