'use client';

import { useMemo, useState } from 'react';
import { buildChord, CHORD_GROUPS, CHORD_QUALITIES } from '@/domain/theory/chords';
import { midiOctave, pitchName } from '@/domain/theory/instruments';
import { formatNote, THEORY_ROOTS, type NameStyle } from '@/domain/theory/notes';
import { buildScale, SCALE_GROUPS, SCALES } from '@/domain/theory/scales';
import InstrumentControls from './InstrumentControls';
import InstrumentView from './InstrumentView';
import NameStyleToggle from './NameStyleToggle';
import { useInstrument } from './useInstrument';
import { SparklesIcon } from '@/shared/ui/Icons';
import { BanIcon, ChordIcon, EyeIcon, EyeOffIcon, LayersIcon, ScaleIcon } from './TheoryIcons';
import ToggleGroup from './ToggleGroup';
import RootPicker from './RootPicker';

type Highlight = 'all' | 'scale' | 'chord';

const FRET_OPTIONS = [12, 15, 19, 24];
const OCTAVE_OPTIONS = [2, 3, 4];

/** Todas las notas del piano y del mástil, con la opción de resaltar encima una escala o un acorde. */
export default function NotesExplorer() {
    const instrument = useInstrument('guitar');
    const [style, setStyle] = useState<NameStyle>('symbol');
    const [highlight, setHighlight] = useState<Highlight>('all');
    const [root, setRoot] = useState<string>('C');
    const [scaleId, setScaleId] = useState<string>('major');
    const [qualityId, setQualityId] = useState<string>('maj');
    const [showOctave, setShowOctave] = useState<boolean>(true);
    const [frets, setFrets] = useState<number>(15);
    const [octaves, setOctaves] = useState<number>(3);

    const scale = useMemo(() => buildScale(root, scaleId), [root, scaleId]);
    const chord = useMemo(() => buildChord(root, qualityId), [root, qualityId]);
    const notes = highlight === 'scale' ? scale?.notes ?? null : highlight === 'chord' ? chord?.notes ?? null : null;

    const fmt = (n: string) => formatNote(n, style);
    const guitar = instrument.instrument === 'guitar';
    const title =
        highlight === 'scale' && scale ? `${fmt(root)} ${scale.def.name.toLowerCase()}`
            : highlight === 'chord' && chord ? `Acorde ${formatNote(chord.symbol.slice(0, root.length), style)}${chord.symbol.slice(root.length)}`
                : guitar ? 'Todas las notas del mástil' : 'Todas las notas del teclado';

    return (
        <div className="th-panel">
            <div className="th-controls">
                <InstrumentControls state={instrument} />
                <NameStyleToggle value={style} onChange={setStyle} />
                <ToggleGroup
                    label="Octava"
                    icon={<LayersIcon />}
                    value={showOctave ? 'on' : 'off'}
                    onChange={(v) => setShowOctave(v === 'on')}
                    options={[
                        { value: 'on', label: 'Sí', icon: <EyeIcon /> },
                        { value: 'off', label: 'No', icon: <EyeOffIcon /> },
                    ]}
                />
                {guitar ? (
                    <label className="th-field">
                        <span className="lb">Trastes</span>
                        <select className="th-select" value={frets} onChange={(e) => setFrets(Number(e.target.value))}>
                            {FRET_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </label>
                ) : (
                    <label className="th-field">
                        <span className="lb">Octavas</span>
                        <select className="th-select" value={octaves} onChange={(e) => setOctaves(Number(e.target.value))}>
                            {OCTAVE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </label>
                )}
            </div>

            <div className="th-controls">
                <ToggleGroup
                    label="Resaltar"
                    icon={<SparklesIcon />}
                    value={highlight}
                    onChange={setHighlight}
                    options={[
                        { value: 'all', label: 'Nada', icon: <BanIcon /> },
                        { value: 'scale', label: 'Escala', icon: <ScaleIcon /> },
                        { value: 'chord', label: 'Acorde', icon: <ChordIcon /> },
                    ]}
                />
                {highlight !== 'all' && (
                    <RootPicker label="Tónica" value={root} onChange={setRoot} style={style} />
                )}
                {highlight === 'scale' && (
                    <label className="th-field">
                        <span className="lb">Escala</span>
                        <select className="th-select" value={scaleId} onChange={(e) => setScaleId(e.target.value)}>
                            {SCALE_GROUPS.map((g) => (
                                <optgroup key={g.id} label={g.label}>
                                    {SCALES.filter((s) => s.group === g.id).map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </label>
                )}
                {highlight === 'chord' && (
                    <label className="th-field">
                        <span className="lb">Tipo de acorde</span>
                        <select className="th-select" value={qualityId} onChange={(e) => setQualityId(e.target.value)}>
                            {CHORD_GROUPS.map((g) => (
                                <optgroup key={g.id} label={g.label}>
                                    {CHORD_QUALITIES.filter((q) => q.group === g.id).map((q) => (
                                        <option key={q.id} value={q.id}>{q.name}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            <section className="th-card">
                <h2>{title}</h2>
                {notes && (
                    <div className="th-notes">
                        {notes.map((n, i) => (
                            <div key={i} className={`th-note${i === 0 ? ' root' : ''}`}>
                                <small>{n.degree}</small>
                                <strong>{fmt(n.name)}</strong>
                            </div>
                        ))}
                    </div>
                )}
                <InstrumentView
                    notes={notes}
                    style={style}
                    instrument={instrument.instrument}
                    tuning={instrument.tuning}
                    showOctave={showOctave}
                    frets={frets}
                    octaves={octaves}
                    allNames
                />
            </section>

            {guitar && (
                <section className="th-card">
                    <h3>Afinación</h3>
                    <p className="th-muted">De la cuerda más grave a la más aguda ({instrument.tuning.label}):</p>
                    <div className="th-notes">
                        {instrument.tuning.strings.map((midi, i) => (
                            <div key={i} className="th-note">
                                <small>Cuerda {6 - i}</small>
                                <strong>{fmt(pitchName(midi % 12, Boolean(instrument.tuning.flats)))}{midiOctave(midi)}</strong>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="th-card">
                <h3>Cómo leer los nombres</h3>
                <p className="th-muted">
                    La letra es la nota y el número, la octava: C4 es el do central del piano. Cada nota se repite en varias
                    cuerdas y trastes de la guitarra, con la misma altura en las octavas que indica el número. Las notas con
                    sostenido (#) y su equivalente con bemol (b) suenan igual: Db es lo mismo que C#.
                </p>
            </section>
        </div>
    );
}