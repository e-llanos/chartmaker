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
    /** Solo iconos: el nombre queda como etiqueta accesible y como ayuda al pasar el cursor. */
    iconOnly?: boolean;
}

/** Selector de una opción entre pocas: botones con icono, el elegido se rellena de color. */
export default function ToggleGroup<T extends string>({
    label, icon, value, options, onChange, iconOnly = false,
}: ToggleGroupProps<T>) {
    return (
        <div className="th-field">
            {!iconOnly && <span className="lb th-label">{icon}{label}</span>}
            <div className="th-toggle" role="group" aria-label={label}>
                {options.map((o) => (
                    <button
                        key={o.value}
                        type="button"
                        className={`th-toggle-btn${iconOnly ? ' icon' : ''}`}
                        aria-pressed={value === o.value}
                        aria-label={iconOnly ? o.label : undefined}
                        title={iconOnly ? o.label : undefined}
                        onClick={() => onChange(o.value)}
                    >
                        {o.icon}
                        {!iconOnly && <span>{o.label}</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}