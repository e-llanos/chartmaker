'use client';

import { useRef } from 'react';
import { isPracticalKey, parseKey } from '@/domain/music/core/key';
import { formatKeyLabel, type Notation } from '@/domain/music/notation/engine';

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const ACCIDENTALS = [
    { value: 'b', glyph: '♭', label: 'Bemol' },
    { value: '#', glyph: '♯', label: 'Sostenido' },
] as const;

interface KeyPickerProps {
    currentKey: string;
    originalKey: string;
    notation: Notation;
    onKeyChange: (key: string) => void;
}

function usable(tonic: string, minor: boolean): boolean {
    const key = parseKey(`${tonic}${minor ? 'm' : ''}`);
    return key !== null && isPracticalKey(key);
}

/**
 * Botón con la tonalidad actual que abre un panel para elegir nota y alteración.
 * Usa <dialog>: va en la capa superior (no lo recorta ni lo desplaza ningún contenedor),
 * y Escape y el foco los resuelve el navegador.
 */
export default function KeyPicker({ currentKey, originalKey, notation, onKeyChange }: KeyPickerProps) {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const parsed = parseKey(currentKey);
    const letter = parsed?.tonic[0] ?? 'C';
    const accidental = parsed?.tonic.slice(1) ?? '';
    const minor = parsed?.mode === 'minor';
    const transposed = currentKey !== originalKey;
    const label = formatKeyLabel(currentKey, notation);

    function open() {
        const dialog = dialogRef.current;
        const trigger = triggerRef.current;
        if (!dialog || !trigger) return;
        if (window.matchMedia('(min-width: 721px)').matches) {
            // Escritorio: panel pegado debajo del botón, alineado a su derecha.
            const r = trigger.getBoundingClientRect();
            dialog.style.top = `${r.bottom + 6}px`;
            dialog.style.right = `${Math.max(12, window.innerWidth - r.right)}px`;
        } else {
            // Móvil: hoja inferior, la coloca el CSS.
            dialog.style.top = '';
            dialog.style.right = '';
        }
        dialog.showModal();
    }

    function pick(nextLetter: string, nextAccidental: string) {
        // Si la combinación no existe (p. ej. de Mi♭ a Fa♭), se queda la nota natural.
        const tonic = usable(nextLetter + nextAccidental, minor) ? nextLetter + nextAccidental : nextLetter;
        onKeyChange(tonic + (minor ? 'm' : ''));
    }

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className={transposed ? 'key-trigger is-transposed' : 'key-trigger'}
                aria-haspopup="dialog"
                aria-label={`Tonalidad: ${label}`}
                title="Tonalidad"
                onClick={open}
            >
                {label}
            </button>

            <dialog
                ref={dialogRef}
                className="key-dialog"
                aria-label="Elegir tonalidad"
                onClick={(e) => {
                    if (e.target === e.currentTarget) e.currentTarget.close();
                }}
            >
                <div className="key-panel">
                    <div className="key-panel-head">
                        <button
                            type="button"
                            className="key-original"
                            disabled={!transposed}
                            onClick={() => onKeyChange(originalKey)}
                            title="Volver a la tonalidad original"
                        >
                            <span>Original</span>
                            <strong>{formatKeyLabel(originalKey, notation)}</strong>
                        </button>
                        <button
                            type="button"
                            className="key-done"
                            onClick={() => dialogRef.current?.close()}
                        >
                            Listo
                        </button>
                    </div>

                    <div className="key-row" role="group" aria-label="Nota">
                        {LETTERS.map((l) => (
                            <button
                                key={l}
                                type="button"
                                className="key-btn"
                                aria-pressed={l === letter}
                                onClick={() => pick(l, accidental)}
                            >
                                {formatKeyLabel(l, notation)}
                            </button>
                        ))}
                    </div>

                    <div className="key-row" role="group" aria-label="Alteración">
                        {ACCIDENTALS.map((a) => {
                            const ok = usable(letter + a.value, minor);
                            return (
                                <button
                                    key={a.value}
                                    type="button"
                                    className="key-btn"
                                    aria-label={a.label}
                                    aria-pressed={a.value === accidental}
                                    disabled={!ok}
                                    title={ok ? a.label : `${a.label} no existe en esta tonalidad`}
                                    onClick={() => pick(letter, a.value === accidental ? '' : a.value)}
                                >
                                    {a.glyph}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </dialog>
        </>
    );
}