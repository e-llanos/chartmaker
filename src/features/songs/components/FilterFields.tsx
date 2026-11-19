'use client';

import { useState } from 'react';
import { SONG_KEYS } from '@/domain/music/core/key';
import Select from '@/shared/ui/Select';

interface FilterFieldsProps {
    initialKey: string;
    initialChart: boolean;
}

const KEY_OPTIONS = [{ value: '', label: 'Todas' }, ...SONG_KEYS.map((k) => ({ value: k, label: k }))];

/** Campos del filtro con controles propios; envían su valor al formulario con campos ocultos. */
export default function FilterFields({ initialKey, initialChart }: FilterFieldsProps) {
    const [key, setKey] = useState(initialKey);
    const [chart, setChart] = useState(initialChart);

    return (
        <>
            <input type="hidden" name="key" value={key} />
            {chart && <input type="hidden" name="chart" value="1" />}

            <div className="lib-pop-field">
                <span>Tonalidad</span>
                <Select label="Tonalidad" value={key} onChange={setKey} options={KEY_OPTIONS} />
            </div>

            <div className="lib-pop-switch">
                <span>Solo con chart</span>
                <button
                    type="button"
                    role="switch"
                    className="switch"
                    aria-label="Solo con chart"
                    aria-checked={chart}
                    onClick={() => setChart((c) => !c)}
                />
            </div>
        </>
    );
}