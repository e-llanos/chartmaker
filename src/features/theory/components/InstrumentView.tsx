import type { Instrument, Tuning } from '@/domain/music/instruments';
import type { NameStyle, SpelledNote } from '@/domain/music/core';
import Fretboard from './Fretboard';
import Keyboard from './Keyboard';

interface InstrumentViewProps {
    notes: SpelledNote[] | null;
    style: NameStyle;
    instrument: Instrument;
    tuning: Tuning;
    showOctave?: boolean;
    /** Solo guitarra: último traste. */
    frets?: number;
    /** Solo piano: número de octavas y escritura de todas las teclas. */
    octaves?: number;
    allNames?: boolean;
}

/** Muestra las notas en el piano o en el mástil, según el instrumento elegido. */
export default function InstrumentView({
    notes, style, instrument, tuning, showOctave, frets, octaves, allNames,
}: InstrumentViewProps) {
    return instrument === 'piano' ? (
        <Keyboard notes={notes} style={style} showOctave={showOctave} octaves={octaves} allNames={allNames} />
    ) : (
        <Fretboard notes={notes} style={style} tuning={tuning} showOctave={showOctave} frets={frets} />
    );
}