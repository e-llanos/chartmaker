'use client';

import type { ReactNode } from 'react';

export interface ToggleOption<T extends string> {
    value: T;
    label: string;
    icon?: ReactNode;
}

interface ToggleGroupProps<T extends string> {
    label: string;
    icon?: ReactNode;
    value: T;
    options: ToggleOption<T>[];
    onChange: (value: T) => void;
}

/** Selector de una opción entre pocas: botones con icono, el elegido se rellena de color. */
export default function ToggleGroup<T extends string>({
    label, icon, value, options, onChange,
}: ToggleGroupProps<T>) {
    return (
        <div className="th-field">
            <span className="lb th-label">{icon}{label}</span>
            <div className="th-toggle" role="group" aria-label={label}>
                {options.map((o) => (
                    <button key={o.value} type="button" className="th-toggle-btn"
                        aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
                        {o.icon}
                        <span>{o.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}