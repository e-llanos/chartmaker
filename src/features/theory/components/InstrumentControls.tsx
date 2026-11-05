'use client';

import { TUNINGS, type Instrument } from '@/domain/theory/instruments';
import { GuitarIcon, PianoIcon, SlidersIcon } from './TheoryIcons';
import ToggleGroup from './ToggleGroup';
import type { InstrumentState } from './useInstrument';

interface InstrumentControlsProps {
    state: InstrumentState;
}

/** Dos botones con icono (teclado y guitarra) y, en guitarra, la afinación. */
export default function InstrumentControls({ state }: InstrumentControlsProps) {
    return (
        <>
            <ToggleGroup<Instrument>
                label="Instrumento"
                iconOnly
                value={state.instrument}
                onChange={state.setInstrument}
                options={[
                    { value: 'piano', label: 'Piano', icon: <PianoIcon /> },
                    { value: 'guitar', label: 'Guitarra', icon: <GuitarIcon /> },
                ]}
            />
            {state.instrument === 'guitar' && (
                <label className="th-field">
                    <span className="lb th-label"><SlidersIcon />Afinación</span>
                    <select className="th-select" value={state.tuningId} onChange={(e) => state.setTuningId(e.target.value)}>
                        {TUNINGS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                </label>
            )}
        </>
    );
}