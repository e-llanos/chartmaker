'use client';

import type { NameStyle } from '@/domain/theory/notes';
import { NoteIcon } from './TheoryIcons';
import ToggleGroup from './ToggleGroup';

interface NameStyleToggleProps {
    value: NameStyle;
    onChange: (style: NameStyle) => void;
}

export default function NameStyleToggle({ value, onChange }: NameStyleToggleProps) {
    return (
        <ToggleGroup
            label="Notación"
            icon={<NoteIcon />}
            value={value}
            onChange={onChange}
            options={[
                { value: 'symbol', label: 'C D E' },
                { value: 'latin', label: 'Do Re Mi' },
            ]}
        />
    );
}