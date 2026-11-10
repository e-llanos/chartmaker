'use client';

import { useMemo, useState } from 'react';
import { diatonicChords, FUNCTION_LABELS, type HarmonicFunction } from '@/domain/theory/chords';
import {
    CADENCES, circleOfFifths, circleRoles, PROGRESSIONS, resolveProgression, type Progression,
} from '@/domain/theory/harmony';
import { formatChordSymbol, formatNote, parseNote, type NameStyle, keySignatureNotes } from '@/domain/music/core';
import { buildScale } from '@/domain/theory/scales';
import CircleOfFifths from './CircleOfFifths';
import DiatonicTable from './DiatonicTable';
import NameStyleToggle from './NameStyleToggle';
import { MoonIcon, SunIcon } from './TheoryIcons';
import ToggleGroup from './ToggleGroup';
import RootPicker from './RootPicker';

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
    return (
        <div className="th-chords">
            {resolveProgression(root, progression).map((c, i) => (
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
    const keys = useMemo(() => circleOfFifths(), []);
    const roles = useMemo(() => circleRoles(root, minor), [root, minor]);

    if (!scale || !chords) return null;

    const fmt = (n: string) => formatNote(n, style);
    const progressions = PROGRESSIONS.filter((p) => (p.mode === 'minor') === minor);

    // Armadura y relativa de la tonalidad elegida
    const pc = parseNote(root)?.pc;
    const key = keys.find((k) => (minor ? k.minorPc : k.majorPc) === pc);
    const altered = key ? keySignatureNotes(key.accidentals) : [];
    const relative = key ? (minor ? `${key.major} mayor` : `${key.minor}`) : '';

    return (
        <div className="th-panel">
            <div className="th-controls">
                <RootPicker label="Tonalidad" value={root} onChange={setRoot} style={style} />
                <ToggleGroup
                    label="Modo"
                    icon={<SunIcon />}
                    value={minor ? 'minor' : 'major'}
                    onChange={(v) => setMinor(v === 'minor')}
                    options={[
                        { value: 'major', label: 'Mayor', icon: <SunIcon /> },
                        { value: 'minor', label: 'Menor', icon: <MoonIcon /> },
                    ]}
                />
                <NameStyleToggle value={style} onChange={setStyle} />
            </div>

            <section className="th-card">
                <h3>Círculo de quintas</h3>
                <div className="th-circle-layout">
                    <CircleOfFifths
                        root={root}
                        minor={minor}
                        style={style}
                        onSelect={(r, m) => { setRoot(r); setMinor(m); }}
                    />
                    <div className="th-circle-info">
                        <h2>{fmt(root)} {minor ? 'menor' : 'mayor'}</h2>
                        <dl className="th-facts">
                            <div><dt>Armadura</dt><dd>{key?.signature ?? '—'}</dd></div>
                            <div>
                                <dt>Notas alteradas</dt>
                                <dd>{altered.length ? altered.map(fmt).join(' ') : 'Ninguna'}</dd>
                            </div>
                            <div>
                                <dt>{minor ? 'Relativa mayor' : 'Relativa menor'}</dt>
                                <dd>{minor ? fmt(key?.major ?? '') + ' mayor' : formatChordSymbol(relative, style)}</dd>
                            </div>
                        </dl>
                        <p className="th-muted">
                            Toca una tonalidad para cambiarla. Los acordes de la tonalidad se colorean según su función;
                            los vecinos de la tónica en el círculo son los que más se usan con ella.
                        </p>
                        <div className="th-chords">
                            {[...roles]
                                .sort((a, b) => FUNCTIONS.indexOf(a.fn) - FUNCTIONS.indexOf(b.fn))
                                .map((r) => (
                                    <span key={`${r.ring}-${r.index}`} className={`th-chord fn-${r.fn}`}>
                                        <strong>{formatChordSymbol(r.symbol, style)}</strong>
                                        <small>{r.roman}</small>
                                    </span>
                                ))}
                        </div>
                    </div>
                </div>
            </section>

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
        </div>
    );
}