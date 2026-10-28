'use client';

import { useMemo, useState } from 'react';
import { ALL_KEYS, diatonicChords } from '@/domain/music/engine';
import { COMPAS_OPTIONS, TEMPO_MAX, TEMPO_MIN } from '@/domain/song/constants';
import type { SectionType } from '@/domain/sections/section-types';
import { REPEAT_MAX, REPEAT_MIN, type SectionRepeatInfo } from '@/domain/chordsheet/section-text';
import type { CifradoData } from './CifradoEditor';
import SectionTypeButtons from '../shared/SectionTypeButtons';

interface CifradoToolbarProps {
    data: CifradoData;
    onFieldChange: <K extends keyof CifradoData>(field: K, value: CifradoData[K]) => void;
    onAddSection: (type: SectionType) => void;
    onInsertChord: (chord: string) => void;
    onInsertNote: () => void;
    repeat: SectionRepeatInfo | null;
    onRepeatChange: (n: number) => void;
}

export default function CifradoToolbar({
    data, onFieldChange, onAddSection, onInsertChord, onInsertNote, repeat, onRepeatChange
}: CifradoToolbarProps) {
    const [chord, setChord] = useState<string>('');
    const palette = useMemo(() => diatonicChords(data.key), [data.key]);

    function submitChord() {
        if (!chord.trim()) return;
        onInsertChord(chord.trim());
        setChord('');
    }

    const compasKnown = (COMPAS_OPTIONS as readonly string[]).includes(data.compas);

    return (
        <>
            <details className="tool-group tool-collapsible" open={false} /* open */>
                <summary className="tool-summary">
                    <span className="tool-summary-text">
                        <h3>Datos de la canción</h3>
                        <span className="tool-summary-meta">
                            {[data.title || 'Sin título', data.key, `${data.tempo} BPM`, data.compas].join(' · ')}
                        </span>
                    </span>
                    <span className="tool-chevron" aria-hidden="true" />
                </summary>

                <div className="tool-fields">
                    <label className="tool-field">
                        <span className="tool-label">Título</span>
                        <input className="tool-input" value={data.title}
                            onChange={(e) => onFieldChange('title', e.target.value)} />
                    </label>
                    <label className="tool-field">
                        <span className="tool-label">Artista</span>
                        <input className="tool-input" value={data.artist}
                            onChange={(e) => onFieldChange('artist', e.target.value)} />
                    </label>
                    <label className="tool-field">
                        <span className="tool-label">Álbum</span>
                        <input className="tool-input" value={data.album}
                            onChange={(e) => onFieldChange('album', e.target.value)} />
                    </label>
                    <label className="tool-field">
                        <span className="tool-label">URL de la portada</span>
                        <input className="tool-input" type="url" value={data.imageUrl ?? ''}
                            placeholder="https://…"
                            onChange={(e) => onFieldChange('imageUrl', e.target.value)} />
                    </label>

                    <div className="tool-grid-3">
                        <label className="tool-field">
                            <span className="tool-label">Tonalidad</span>
                            <select className="tool-select" value={data.key}
                                onChange={(e) => onFieldChange('key', e.target.value)}>
                                {ALL_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                            </select>
                        </label>
                        <label className="tool-field">
                            <span className="tool-label">Tempo (BPM)</span>
                            <input className="tool-input" type="number" inputMode="numeric"
                                min={TEMPO_MIN} max={TEMPO_MAX} value={data.tempo || ''}
                                onChange={(e) => onFieldChange('tempo', Number(e.target.value))} />
                        </label>
                        <label className="tool-field">
                            <span className="tool-label">Compás</span>
                            <select className="tool-select" value={data.compas}
                                onChange={(e) => onFieldChange('compas', e.target.value)}>
                                {COMPAS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                                {!compasKnown && <option value={data.compas}>{data.compas}</option>}
                            </select>
                        </label>
                    </div>
                </div>
            </details>

            <div className="tool-group">
                <h3>Agregar sección</h3>
                <SectionTypeButtons onAdd={onAddSection} />
            </div>
            <div className="tool-group">
                <h3>Repeticiones</h3>
                {repeat ? (
                    <div className="tool-row">
                        <span className="tool-label">{repeat.label}</span>
                        <div className="stepper">
                            <button type="button" className="ghost-btn" aria-label="Menos repeticiones"
                                disabled={repeat.repeat <= REPEAT_MIN}
                                onClick={() => onRepeatChange(repeat.repeat - 1)}>−</button>
                            <output className="stepper-value">×{repeat.repeat}</output>
                            <button type="button" className="ghost-btn" aria-label="Más repeticiones"
                                disabled={repeat.repeat >= REPEAT_MAX}
                                onClick={() => onRepeatChange(repeat.repeat + 1)}>+</button>
                        </div>
                    </div>
                ) : (
                    <p className="hint">Coloca el cursor dentro de una sección para definir cuántas veces se repite.</p>
                )}
            </div>

            <div className="tool-group">
                <h3>Insertar acorde en el cursor</h3>
                <div className="tool-row">
                    <input className="tool-input" value={chord} onChange={(e) => setChord(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitChord(); } }}
                        placeholder="Ej. Em, D/F#, Cmaj7" aria-label="Acorde a insertar" />
                    <button type="button" className="primary-btn" onClick={submitChord}>Insertar</button>
                </div>
                {palette.length > 0 && (
                    <div className="chord-palette" aria-label={`Acordes de ${data.key}`}>
                        {palette.map((c) => (
                            <button key={c} type="button" className="chip" onClick={() => onInsertChord(c)}>{c}</button>
                        ))}
                    </div>
                )}
                <button type="button" className="ghost-btn" onClick={onInsertNote}>
                    Agregar anotación a la sección
                </button>
            </div>
        </>
    );
}