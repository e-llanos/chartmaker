'use client';

import { useMemo, type KeyboardEvent } from 'react';
import { FUNCTION_LABELS, type HarmonicFunction } from '@/domain/theory/chords';
import { circleOfFifths, circleRoles, type CircleRole } from '@/domain/theory/harmony';
import { formatChordSymbol, formatNote, parseNote, type NameStyle } from '@/domain/music/core';

const SIZE = 540;
const CENTER = SIZE / 2;
const R_OUTER = 192;
const R_INNER = 118;
const R_LABEL = 238;
const NODE_OUTER = 29;
const NODE_INNER = 21;

const FUNCTION_COLORS: Record<HarmonicFunction, string> = { T: '#3fb5a6', SD: '#d9a93f', D: '#e0684a' };
const LEGEND: HarmonicFunction[] = ['T', 'SD', 'D'];

const round = (n: number): number => Math.round(n * 100) / 100;

/** Posición de la casilla `index` (0 arriba, en sentido horario) sobre un anillo. */
function at(index: number, radius: number) {
    const angle = ((-90 + index * 30) * Math.PI) / 180;
    return {
        // Se redondea: Math.cos/sin difieren en el último decimal entre servidor y navegador
        x: round(CENTER + radius * Math.cos(angle)),
        y: round(CENTER + radius * Math.sin(angle)),
    };
}

const signatureLabel = (n: number): string => (n === 0 ? '—' : n > 0 ? `${n}♯` : `${-n}♭`);

interface CircleOfFifthsProps {
    root: string;
    minor: boolean;
    style: NameStyle;
    onSelect: (root: string, minor: boolean) => void;
}

/** Círculo de quintas: mayores fuera, relativas menores dentro y armadura en el borde. */
export default function CircleOfFifths({ root, minor, style, onSelect }: CircleOfFifthsProps) {
    const keys = useMemo(() => circleOfFifths(), []);
    const roles = useMemo(() => circleRoles(root, minor), [root, minor]);
    const pc = parseNote(root)?.pc;
    const selected = keys.find((k) => (minor ? k.minorPc : k.majorPc) === pc);

    const roleAt = (ring: CircleRole['ring'], index: number) =>
        roles.find((r) => r.ring === ring && r.index === index);

    function renderNode(ring: CircleRole['ring'], i: number) {
        const key = keys[i];
        if (!key) return null;
        const role = roleAt(ring, i);
        const radius = ring === 'outer' ? NODE_OUTER : NODE_INNER;
        const { x, y } = at(i, ring === 'outer' ? R_OUTER : R_INNER);
        const label = ring === 'outer' ? formatNote(key.major, style) : formatChordSymbol(key.minor, style);
        const select = () => onSelect(ring === 'outer' ? key.major : key.minorRoot, ring === 'inner');
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                select();
            }
        };
        return (
            <g key={`${ring}-${i}`} className={`cf-node ${ring}${role ? ' role' : ''}`}
                transform={`translate(${x} ${y})`} role="button" tabIndex={0}
                aria-label={`${label}${ring === 'outer' ? ' mayor' : ''}, armadura ${key.signature}`}
                aria-pressed={Boolean(role?.tonic)} onClick={select} onKeyDown={onKey}>
                <circle r={radius} style={role ? { fill: FUNCTION_COLORS[role.fn] } : undefined} />
                {role?.tonic && <circle className="cf-ring" r={radius + 6} />}
                <text>{label}</text>
            </g>
        );
    }

    return (
        <div>
            <svg className="cf" viewBox={`0 0 ${SIZE} ${SIZE}`} role="group" aria-label="Círculo de quintas">
                <circle className="cf-track" cx={CENTER} cy={CENTER} r={R_OUTER} />
                <circle className="cf-track" cx={CENTER} cy={CENTER} r={R_INNER} />

                {keys.map((k, i) => {
                    const p = at(i, R_LABEL);
                    return (
                        <text key={`sig${i}`} className={`cf-sig${roleAt('outer', i) ? ' hot' : ''}`} x={p.x} y={p.y}>
                            {signatureLabel(k.accidentals)}
                        </text>
                    );
                })}

                {keys.map((_, i) => renderNode('outer', i))}
                {keys.map((_, i) => renderNode('inner', i))}

                <text className="cf-center-title" x={CENTER} y={CENTER - 8}>
                    {formatNote(root, style)} {minor ? 'menor' : 'mayor'}
                </text>
                <text className="cf-center-sub" x={CENTER} y={CENTER + 18}>{selected?.signature ?? ''}</text>
            </svg>

            <div className="cf-legend">
                {LEGEND.map((fn) => (
                    <span key={fn}><i className="cf-dot" style={{ background: FUNCTION_COLORS[fn] }} />{FUNCTION_LABELS[fn]}</span>
                ))}
                <span><i className="cf-dot ring" />Tonalidad elegida</span>
            </div>
        </div>
    );
}