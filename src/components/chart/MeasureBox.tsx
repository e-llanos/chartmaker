import { segments } from '@/domain/chart/utils';
import { padBeats } from '@/domain/music/meter';
import type { ChartMeasure } from '@/domain/chart/types';
import ChordText from '../shared/ChordText';

interface MeasureBoxProps {
    measure: ChartMeasure;
    /** Tiempos por compás según el compás de la canción. */
    count: number;
    mapChord: (chord: string) => string;
}

export default function MeasureBox({ measure, count, mapChord }: MeasureBoxProps) {
    const parts = segments(padBeats(measure.beats, count));
    const repeat = measure.repeat ?? 1;
    return (
        <div className="measure-box">
            {parts.map((p, i) => (
                <span key={i} className="beat" style={{ flexGrow: p.span }}>
                    {p.chord ? <ChordText chord={mapChord(p.chord)} /> : <span className="beat-empty">·</span>}
                </span>
            ))}
            {repeat > 1 && <span className="repeat-badge">×{repeat}</span>}
        </div>
    );
}