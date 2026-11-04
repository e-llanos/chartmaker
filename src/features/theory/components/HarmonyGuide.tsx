'use client';

import { useMemo, useState } from 'react';
import { diatonicChords, FUNCTION_LABELS, type HarmonicFunction } from '@/domain/theory/chords';
import { CADENCES, circleOfFifths, PROGRESSIONS, resolveProgression, type Progression } from '@/domain/theory/harmony';
import { formatChordSymbol, formatNote, THEORY_ROOTS, type NameStyle } from '@/domain/theory/notes';
import { buildScale } from '@/domain/theory/scales';
import DiatonicTable from './DiatonicTable';
import NameStyleToggle from './NameStyleToggle';

const FUNCTION_TEXT: Record<HarmonicFunction, string> = {
    T: 'Reposo y estabilidad: es el «hogar» de la tonalidad.',
    SD: 'Se aleja de la tónica y crea movimiento.',
    D: 'Genera tensión y pide resolver en la tónica.',
};

const FUNCTIONS: HarmonicFunction[] = ['T', 'SD', 'D'];

interface ChordChipsProps {
    root: string;
    progression: Progression;
    style: NameStyle;
}

function ChordChips({ root, progression, style }: ChordChipsProps) {
    const items = resolveProgression(root, progression);
    return (
        <div className="th-chords">
            {items.map((c, i) => (
                <span key={i} className="th-chord">
                    <strong>{formatChordSymbol(c.symbol, style)}</strong>
                    <small>{c.roman}</small>
                </span>
            ))}
        </div>
    );
}

export default function HarmonyGuide() {
    const [root, setRoot] = useState<string>('C');
    const [minor, setMinor] = useState<boolean>(false);
    const [style, setStyle] = useState<NameStyle>('symbol');

    const scale = useMemo(() => buildScale(root, minor ? 'natural-minor' : 'major'), [root, minor]);
    const chords = useMemo(() => (scale ? diatonicChords(scale) : null), [scale]);
    const circle = useMemo(() => circleOfFifths(), []);

    if (!scale || !chords) return null;

    const fmt = (n: string) => formatNote(n, style);
    const progressions = PROGRESSIONS.filter((p) => (p.mode === 'minor') === minor);

    return (
        <div className="th-panel">
            <div className="th-controls">
                <label className="th-field">
                    <span className="lb">Tonalidad</span>
                    <select className="tool-select" value={root} onChange={(e) => setRoot(e.target.value)}>
                        {THEORY_ROOTS.map((r) => <option key={r} value={r}>{fmt(r)}</option>)}
                    </select>
                </label>
                <div className="th-field">
                    <span className="lb">Modo</span>
                    <div className="seg" role="group" aria-label="Modo de la tonalidad">
                        <button type="button" aria-pressed={!minor} onClick={() => setMinor(false)}>Mayor</button>
                        <button type="button" aria-pressed={minor} onClick={() => setMinor(true)}>Menor</button>
                    </div>
                </div>
                <NameStyleToggle value={style} onChange={setStyle} />
            </div>

            <section className="th-card">
                <h2>Acordes de {fmt(root)} {minor ? 'menor' : 'mayor'}</h2>
                <DiatonicTable chords={chords} style={style} />
            </section>

            <section className="th-card">
                <h3>Funciones armónicas</h3>
                <p className="th-muted">Cada acorde de la tonalidad cumple un papel. La música suele moverse entre estos tres.</p>
                <div className="th-grid">
                    {FUNCTIONS.map((fn) => (
                        <div key={fn} className="th-mini">
                            <span className={`th-chip fn-${fn}`}>{FUNCTION_LABELS[fn]}</span>
                            <p className="th-muted">{FUNCTION_TEXT[fn]}</p>
                            <div className="th-chords">
                                {chords.filter((c) => c.fn === fn && c.triad).map((c) => (
                                    <span key={c.degree} className="th-chord">
                                        <strong>{formatChordSymbol(c.triad?.symbol ?? '', style)}</strong>
                                        <small>{c.triad?.roman}</small>
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="th-card">
                <h3>Progresiones comunes en {fmt(root)} {minor ? 'menor' : 'mayor'}</h3>
                <div className="th-grid">
                    {progressions.map((p) => (
                        <div key={p.id} className="th-mini">
                            <strong>{p.name}</strong>
                            <ChordChips root={root} progression={p} style={style} />
                            <p className="th-muted">{p.note}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="th-card">
                <h3>Cadencias en {fmt(root)} mayor</h3>
                <p className="th-muted">Una cadencia es la forma de cerrar una frase musical.</p>
                <div className="th-grid">
                    {CADENCES.map((p) => (
                        <div key={p.id} className="th-mini">
                            <strong>{p.name}</strong>
                            <ChordChips root={root} progression={p} style={style} />
                            <p className="th-muted">{p.note}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="th-card">
                <h3>Círculo de quintas</h3>
                <p className="th-muted">Cada tonalidad añade una alteración respecto a la anterior. La relativa menor comparte las mismas notas.</p>
                <div className="th-grid">
                    {circle.map((k) => (
                        <div key={k.major} className="th-mini">
                            <strong>{fmt(k.major)} mayor</strong>
                            <span className="th-dim">{k.signature} · relativa {formatChordSymbol(k.minor, style)}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}