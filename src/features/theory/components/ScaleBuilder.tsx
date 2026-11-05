'use client';

import { useMemo, useState } from 'react';
import { containedChords, diatonicChords } from '@/domain/theory/chords';
import { formatChordSymbol, formatNote, THEORY_ROOTS, type NameStyle } from '@/domain/theory/notes';
import { buildScale, modesOf, parentOf, SCALE_GROUPS, SCALES, stepLabel } from '@/domain/theory/scales';
import DiatonicTable from './DiatonicTable';
import NameStyleToggle from './NameStyleToggle';
import InstrumentControls from './InstrumentControls';
import InstrumentView from './InstrumentView';
import { useInstrument } from './useInstrument';
import RootPicker from './RootPicker';

export default function ScaleBuilder() {
    const [root, setRoot] = useState<string>('C');
    const [scaleId, setScaleId] = useState<string>('major');
    const [style, setStyle] = useState<NameStyle>('symbol');
    const instrument = useInstrument();

    const scale = useMemo(() => buildScale(root, scaleId), [root, scaleId]);
    const chords = useMemo(() => (scale ? diatonicChords(scale) : null), [scale]);
    const contained = useMemo(() => (scale && !chords ? containedChords(scale) : []), [scale, chords]);

    if (!scale) return null;

    const fmt = (n: string) => formatNote(n, style);
    const parent = parentOf(scale);
    const modes = modesOf(scale);

    return (
        <div className="th-panel">
            <div className="th-controls">
                <RootPicker label="Tónica" value={root} onChange={setRoot} style={style} />
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
                <NameStyleToggle value={style} onChange={setStyle} />
            </div>

            <section className="th-card">
                <div>
                    <h2>{fmt(scale.root)} {scale.def.name.toLowerCase()}</h2>
                    <p className="th-muted">{scale.def.description}</p>
                </div>

                <div className="th-notes">
                    {scale.notes.map((n, i) => (
                        <div key={i} className={`th-note${i === 0 ? ' root' : ''}`}>
                            <small>{n.degree}</small>
                            <strong>{fmt(n.name)}</strong>
                        </div>
                    ))}
                </div>

                <dl className="th-facts">
                    <div><dt>Fórmula</dt><dd>{scale.def.formula.join(' ')}</dd></div>
                    <div><dt>Tonos y semitonos</dt><dd>{scale.steps.map(stepLabel).join(' – ')}</dd></div>
                    <div><dt>Semitonos</dt><dd>{scale.steps.join(' – ')}</dd></div>
                    <div><dt>Notas</dt><dd>{scale.notes.length}</dd></div>
                </dl>

                <InstrumentView notes={scale.notes} style={style} instrument={instrument.instrument} tuning={instrument.tuning} />
                <div className="th-card-foot">
                    <InstrumentControls state={instrument} />
                </div>
            </section>

            {parent && (
                <section className="th-card">
                    <h3>De dónde sale</h3>
                    <p className="th-muted">
                        Es el grado {parent.degree} de <strong>{fmt(parent.root)} {parent.name.toLowerCase()}</strong> ({parent.family}):
                        tiene las mismas notas, pero empieza en {fmt(scale.root)}.
                    </p>
                </section>
            )}

            {modes && (
                <section className="th-card">
                    <h3>Modos de esta escala</h3>
                    <p className="th-muted">Al empezar en cada nota se obtiene un modo distinto, con las mismas notas.</p>
                    <div className="th-table-wrap">
                        <table className="th-table">
                            <thead><tr><th>Grado</th><th>Modo</th><th>Tónica</th><th>Notas</th></tr></thead>
                            <tbody>
                                {modes.map((m) => (
                                    <tr key={m.degree}>
                                        <td>{m.degree}</td>
                                        <td>{m.name}</td>
                                        <td><strong>{fmt(m.root)}</strong></td>
                                        <td className="th-dim">{m.notes.map(fmt).join(' – ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {chords ? (
                <section className="th-card">
                    <h3>Acordes de la escala</h3>
                    <p className="th-muted">Se obtienen apilando terceras sobre cada grado. Los números romanos son independientes de la tónica.</p>
                    <DiatonicTable chords={chords} style={style} />
                </section>
            ) : (
                <section className="th-card">
                    <h3>Acordes que caben en la escala</h3>
                    <p className="th-muted">
                        Esta escala no tiene siete notas, así que no genera acordes por terceras. Estos son los acordes
                        cuyas notas están todas dentro de ella:
                    </p>
                    <div className="th-table-wrap">
                        <table className="th-table">
                            <thead><tr><th>Sobre</th><th>Acordes</th></tr></thead>
                            <tbody>
                                {contained.map((g) => (
                                    <tr key={g.root}>
                                        <td><strong>{fmt(g.root)}</strong></td>
                                        <td>
                                            {g.chords.map((c) => (
                                                <span key={c.symbol} className="th-chip">{formatChordSymbol(c.symbol, style)}</span>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}