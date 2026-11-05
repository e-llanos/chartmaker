'use client';

import { useMemo, useState } from 'react';
import { buildChord, CHORD_GROUPS, CHORD_QUALITIES } from '@/domain/theory/chords';
import { formatChordSymbol, formatNote, intervalName, THEORY_ROOTS, type NameStyle } from '@/domain/theory/notes';
import NameStyleToggle from './NameStyleToggle';
import InstrumentControls from './InstrumentControls';
import InstrumentView from './InstrumentView';
import { useInstrument } from './useInstrument';
import RootPicker from './RootPicker';

export default function ChordBuilder() {
    const [root, setRoot] = useState<string>('C');
    const [quality, setQuality] = useState<string>('maj');
    const [style, setStyle] = useState<NameStyle>('symbol');
    const instrument = useInstrument();

    const chord = useMemo(() => buildChord(root, quality), [root, quality]);
    if (!chord) return null;

    const fmt = (n: string) => formatNote(n, style);

    return (
        <div className="th-panel">
            <div className="th-controls">
                <RootPicker label="Raíz" value={root} onChange={setRoot} style={style} />
                <label className="th-field">
                    <span className="lb">Tipo de acorde</span>
                    <select className="th-select" value={quality} onChange={(e) => setQuality(e.target.value)}>
                        {CHORD_GROUPS.map((g) => (
                            <optgroup key={g.id} label={g.label}>
                                {CHORD_QUALITIES.filter((q) => q.group === g.id).map((q) => (
                                    <option key={q.id} value={q.id}>{q.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </label>
                <NameStyleToggle value={style} onChange={setStyle} />
            </div>

            <section className="th-card">
                <div>
                    <h2>{formatChordSymbol(chord.symbol, style)}</h2>
                    <p className="th-muted">{chord.quality.name}</p>
                </div>

                <div className="th-notes">
                    {chord.notes.map((n, i) => (
                        <div key={i} className={`th-note${i === 0 ? ' root' : ''}`} title={intervalName(n.degree)}>
                            <small>{n.degree}</small>
                            <strong>{fmt(n.name)}</strong>
                        </div>
                    ))}
                </div>

                <dl className="th-facts">
                    <div><dt>Fórmula</dt><dd>{chord.quality.formula.join(' ')}</dd></div>
                    <div><dt>Intervalos</dt><dd>{chord.notes.map((n) => intervalName(n.degree)).join(' · ')}</dd></div>
                </dl>

                <InstrumentView notes={chord.notes} style={style} instrument={instrument.instrument} tuning={instrument.tuning} />
                <div className="th-card-foot">
                    <InstrumentControls state={instrument} />
                </div>
            </section>

            <section className="th-card">
                <h3>Todos los tipos sobre {fmt(root)}</h3>
                <div className="th-table-wrap">
                    <table className="th-table">
                        <thead><tr><th>Cifrado</th><th>Nombre</th><th>Fórmula</th><th>Notas</th></tr></thead>
                        <tbody>
                            {CHORD_QUALITIES.map((q) => {
                                const c = buildChord(root, q.id);
                                if (!c) return null;
                                return (
                                    <tr key={q.id} className={q.id === quality ? 'active' : undefined}>
                                        <td>
                                            <button type="button" className="th-link" onClick={() => setQuality(q.id)}>
                                                {formatChordSymbol(c.symbol, style)}
                                            </button>
                                        </td>
                                        <td>{q.name}</td>
                                        <td className="th-dim">{q.formula.join(' ')}</td>
                                        <td className="th-dim">{c.notes.map((n) => fmt(n.name)).join(' – ')}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}