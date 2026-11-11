'use client';

import { useState } from 'react';
import { getTuning, type Instrument } from '@/domain/music/instruments';

/** Instrumento elegido (piano o guitarra) y su afinación. */
export function useInstrument(initial: Instrument = 'piano') {
    const [instrument, setInstrument] = useState<Instrument>(initial);
    const [tuningId, setTuningId] = useState<string>('standard');
    return { instrument, setInstrument, tuningId, setTuningId, tuning: getTuning(tuningId) };
}

export type InstrumentState = ReturnType<typeof useInstrument>;