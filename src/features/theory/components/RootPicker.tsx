'use client';

import { formatNote, type NameStyle } from '@/domain/music/core';
import { FlatIcon, NoteIcon, SharpIcon } from './TheoryIcons';

const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

type Accidental = 'natural' | 'sharp' | 'flat';

interface RootPickerProps {
    label: string;
    /** Tónica elegida: "C", "Db", "F#"… */
    value: string;
    onChange: (root: string) => void;
    style: NameStyle;
}

/** Selector de tónica: las siete notas y dos interruptores, sostenido (♯) y bemol (♭). */
export default function RootPicker({ label, value, onChange, style }: RootPickerProps) {
    const letter = value.charAt(0);
    const accidental: Accidental =
        value.charAt(1) === '#' ? 'sharp' : value.charAt(1) === 'b' ? 'flat' : 'natural';

    /** Combina una letra con una alteración. Toda letra admite ♯ y ♭ (E♯, B♯, F♭ y C♭ incluidas). */
    const combine = (l: string, acc: Accidental): string =>
        acc === 'sharp' ? `${l}#` : acc === 'flat' ? `${l}b` : l;

    const toggle = (next: 'sharp' | 'flat') =>
        onChange(accidental === next ? letter : combine(letter, next));

    return (
        <div className="th-field">
            <span className="lb th-label"><NoteIcon />{label}</span>
            <div className="th-roots" role="group" aria-label={label}>
                <div className="th-root-group">
                    {NOTES.map((n) => (
                        <button key={n} type="button" className="th-root-btn"
                            aria-pressed={letter === n}
                            onClick={() => onChange(combine(n, accidental))}>
                            {formatNote(letter === n ? value : n, style)}
                        </button>
                    ))}
                </div>
                <div className="th-root-group">
                    <button type="button" className="th-root-btn" aria-pressed={accidental === 'sharp'}
                        aria-label="Sostenido" title="Sostenido (♯)"
                        onClick={() => toggle('sharp')}>
                        <SharpIcon />
                    </button>
                    <button type="button" className="th-root-btn" aria-pressed={accidental === 'flat'}
                        aria-label="Bemol" title="Bemol (♭)"
                        onClick={() => toggle('flat')}>
                        <FlatIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}