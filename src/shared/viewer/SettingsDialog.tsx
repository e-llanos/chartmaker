'use client';

import { useId, type ReactNode, type RefObject } from 'react';
import { LuColumns2, LuMusic, LuType, LuX } from 'react-icons/lu';
import type { ViewMode } from '@/domain/chordsheet/view-mode';
import type { KeyReference } from '@/domain/music/core/analysis';
import { parseKey, relativeKey } from '@/domain/music/core/key';
import { NOTATION_LABELS, formatKeyLabel, type Notation } from '@/domain/music/notation/engine';
import { FONT_DEFAULT, FONT_MAX, FONT_MIN, FONT_STEP } from './useViewerSettings';
import type { SectionsLayout } from './ViewerToolbar';
import Select from '@/shared/ui/Select';

const MODE_LABELS: Record<ViewMode, string> = {
    full: 'Ambos',
    chords: 'Solo acordes',
    lyrics: 'Solo letra',
};

interface SettingsDialogProps {
    dialogRef: RefObject<HTMLDialogElement | null>;
    currentKey: string;
    notation: Notation;
    onNotationChange: (notation: Notation) => void;
    /** Desde dónde se numeran los acordes; solo aparece en Nashville y romanos con tonalidad menor. */
    reference?: KeyReference;
    onReferenceChange?: (reference: KeyReference) => void;
    fontPercent?: number;
    onFontChange?: (percent: number) => void;
    layout?: SectionsLayout;
    onLayoutChange?: (layout: SectionsLayout) => void;
    mode?: ViewMode;
    onModeChange?: (mode: ViewMode) => void;
    /** Controles propios del visor (por ejemplo, el estilo del chart). */
    controls?: ReactNode;
    /** Exportar. */
    actions?: ReactNode;
}

/** Ventana con las preferencias de visualización. Usa <dialog>: Escape, foco y fondo vienen del navegador. */
export default function SettingsDialog({
    dialogRef, currentKey, notation, onNotationChange, reference, onReferenceChange, fontPercent, onFontChange,
    layout, onLayoutChange, mode, onModeChange, controls, actions,
}: SettingsDialogProps) {
    const titleId = useId();
    const notationEntries = Object.entries(NOTATION_LABELS) as [Notation, string][];
    const modeEntries = Object.entries(MODE_LABELS) as [ViewMode, string][];

    // La numeración solo depende de la referencia en tonalidades menores (Em: i desde la tónica, vi desde G).
    const parsedKey = parseKey(currentKey);
    const relative = parsedKey?.mode === 'minor' ? relativeKey(parsedKey) : null;
    const showReference =
        (notation === 'nashville' || notation === 'roman') && relative !== null && reference !== undefined;

    const close = () => dialogRef.current?.close();

    return (
        <dialog
            ref={dialogRef}
            className="settings-dialog"
            aria-labelledby={titleId}
            // Pulsar el fondo oscuro (el propio <dialog>) lo cierra.
            onClick={(e) => {
                if (e.target === e.currentTarget) e.currentTarget.close();
            }}
        >
            <div className="settings-panel">
                <header className="settings-head">
                    <h2 id={titleId}>Preferencias</h2>
                    <button type="button" className="settings-close" aria-label="Cerrar" onClick={close}>
                        <LuX size={18} aria-hidden="true" />
                    </button>
                </header>

                <div className="settings-body">
                    {mode !== undefined && (
                        <section>
                            <h3 className="pref-title">Vista de canción</h3>
                            <div className="segmented" role="radiogroup" aria-label="Contenido">
                                {modeEntries.map(([value, text]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        role="radio"
                                        aria-checked={mode === value}
                                        onClick={() => onModeChange?.(value)}
                                    >
                                        {text}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        <h3 className="pref-title">Acordes y texto</h3>
                        <div className="pref-card">
                            <div className="pref-row">
                                <span className="pref-label">
                                    <LuMusic size={18} aria-hidden="true" />
                                    Modo de vista de acordes
                                </span>
                                <Select
                                    label="Modo de vista de acordes"
                                    value={notation}
                                    onChange={onNotationChange}
                                    options={notationEntries.map(([value, text]) => ({ value, label: text }))}
                                />
                            </div>

                            {showReference && relative && (
                                <div className="pref-row">
                                    <span className="pref-label">Numerar desde</span>
                                    <Select
                                        label="Numerar desde"
                                        value={reference}
                                        onChange={onReferenceChange ?? (() => { })}
                                        options={[
                                            { value: 'tonic', label: `Tónica (${formatKeyLabel(currentKey, 'symbol')})` },
                                            { value: 'relativeMajor', label: `Relativa (${formatKeyLabel(relative.tonic, 'symbol')})` },
                                        ]}
                                    />
                                </div>
                            )}

                            {fontPercent !== undefined && onFontChange && (
                                <div className="pref-row">
                                    <span className="pref-label">
                                        <LuType size={18} aria-hidden="true" />
                                        Tamaño del texto
                                    </span>
                                    <div className="pref-stepper" role="group" aria-label="Tamaño del texto">
                                        <button
                                            type="button"
                                            aria-label="Reducir el texto"
                                            disabled={fontPercent <= FONT_MIN}
                                            onClick={() => onFontChange(fontPercent - FONT_STEP)}
                                        >
                                            −
                                        </button>
                                        <button
                                            type="button"
                                            className="pref-stepper-value"
                                            aria-label="Restablecer el tamaño del texto"
                                            title="Restablecer"
                                            disabled={fontPercent === FONT_DEFAULT}
                                            onClick={() => onFontChange(FONT_DEFAULT)}
                                        >
                                            {fontPercent}%
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Aumentar el texto"
                                            disabled={fontPercent >= FONT_MAX}
                                            onClick={() => onFontChange(fontPercent + FONT_STEP)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {((layout !== undefined && onLayoutChange) || controls) && (
                        <section>
                            <h3 className="pref-title">Opciones de visualización</h3>
                            <div className="pref-card">
                                {layout !== undefined && onLayoutChange && (
                                    <div className="pref-row">
                                        <span className="pref-label">
                                            <LuColumns2 size={18} aria-hidden="true" />
                                            <span>
                                                Secciones en columnas
                                                <small className="pref-hint">Lado a lado cuando hay espacio</small>
                                            </span>
                                        </span>
                                        <button
                                            type="button"
                                            role="switch"
                                            className="switch"
                                            aria-label="Secciones en columnas"
                                            aria-checked={layout === 'columns'}
                                            onClick={() => onLayoutChange(layout === 'columns' ? 'list' : 'columns')}
                                        />
                                    </div>
                                )}
                                {controls && (
                                    <div className="pref-row">
                                        <span className="pref-label">Estilo del chart</span>
                                        {controls}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {actions && (
                        <section>
                            <h3 className="pref-title">Exportar</h3>
                            <div className="pref-card">{actions}</div>
                        </section>
                    )}
                </div>
            </div>
        </dialog>
    );
}