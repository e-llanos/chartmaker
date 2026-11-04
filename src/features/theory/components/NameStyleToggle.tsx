'use client';

import type { NameStyle } from '@/domain/theory/notes';

interface NameStyleToggleProps {
    value: NameStyle;
    onChange: (style: NameStyle) => void;
}

export default function NameStyleToggle({ value, onChange }: NameStyleToggleProps) {
    return (
        <div className="th-field">
            <span className="lb">Notación</span>
            <div className="seg" role="group" aria-label="Notación de las notas">
                <button type="button" aria-pressed={value === 'symbol'} onClick={() => onChange('symbol')}>C D E</button>
                <button type="button" aria-pressed={value === 'latin'} onClick={() => onChange('latin')}>Do Re Mi</button>
            </div>
        </div>
    );
}