import {
    buildFretboard, DOUBLE_MARKERS, FRET_MARKERS, preferFlatsFor, type Tuning,
} from '@/domain/theory/instruments';
import { formatNote, type NameStyle, type SpelledNote, pitchName } from '@/domain/music/core';

const LEFT = 30;
const COL = 56;
const ROW = 42;
const TOP = 8;
const RADIUS = 16;
const NATURALS = new Set([0, 2, 4, 5, 7, 9, 11]);

interface FretboardProps {
    /** Notas a resaltar; la primera es la tónica. Con null se muestran todas por igual. */
    notes: SpelledNote[] | null;
    style: NameStyle;
    tuning: Tuning;
    /** Último traste que se dibuja (el 0 es la cuerda al aire). */
    frets?: number;
    showOctave?: boolean;
}

/** Mástil de guitarra, traste por traste, con las notas resaltadas. */
export default function Fretboard({ notes, style, tuning, frets = 15, showOctave = false }: FretboardProps) {
    const board = buildFretboard(tuning, frets);
    const flats = preferFlatsFor(notes, tuning);
    const byPc = new Map<number, SpelledNote>();
    for (const n of notes ?? []) if (!byPc.has(n.pc)) byPc.set(n.pc, n);
    const rootPc = notes?.[0]?.pc;

    const width = LEFT + (frets + 1) * COL + 8;
    const bottom = TOP + board.length * ROW;
    const height = bottom + 46;
    const cx = (fret: number) => LEFT + fret * COL + COL / 2;
    const cy = (row: number) => TOP + row * ROW + ROW / 2;

    return (
        <div className="fb-wrap">
            <svg className="fb" viewBox={`0 0 ${width} ${height}`} role="img"
                aria-label={`Mástil de guitarra, ${tuning.label}, con las notas resaltadas`}>
                {/* Cejilla y trastes */}
                <line className="fb-nut" x1={LEFT + COL} y1={TOP} x2={LEFT + COL} y2={bottom} />
                {Array.from({ length: frets - 1 }, (_, i) => {
                    const x = LEFT + (i + 2) * COL;
                    return <line key={`f${i}`} className="fb-fret" x1={x} y1={TOP} x2={x} y2={bottom} />;
                })}

                {/* Cuerdas y su nombre al aire */}
                {board.map((cells, row) => {
                    const open = cells[0];
                    return (
                        <g key={`s${row}`}>
                            <line className="fb-string" x1={LEFT} y1={cy(row)} x2={width - 8} y2={cy(row)}
                                strokeWidth={1 + row * 0.3} />
                            {open && (
                                <text className="fb-name" x={LEFT / 2} y={cy(row)}>
                                    {formatNote(pitchName(open.pc, flats), style)}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Notas */}
                {board.flat().map((c) => {
                    const inScale = byPc.get(c.pc);
                    const name = inScale ? inScale.name : pitchName(c.pc, flats);
                    const label = formatNote(name, style) + (showOctave ? c.octave : '');
                    const cls = notes
                        ? inScale ? (c.pc === rootPc ? 'root' : 'on') : 'off'
                        : NATURALS.has(c.pc) ? '' : 'acc';
                    return (
                        <g key={`${c.row}-${c.fret}`} className={`fb-note ${cls}${showOctave ? ' sm' : ''}`}
                            transform={`translate(${cx(c.fret)} ${cy(c.row)})`}>
                            <circle r={RADIUS} />
                            <text>{label}</text>
                        </g>
                    );
                })}

                {/* Números de traste y marcas */}
                {Array.from({ length: frets + 1 }, (_, f) => (
                    <text key={`n${f}`} className="fb-num" x={cx(f)} y={bottom + 16}>{f}</text>
                ))}
                {FRET_MARKERS.filter((f) => f <= frets).map((f) =>
                    DOUBLE_MARKERS.includes(f) ? (
                        <g key={`m${f}`}>
                            <circle className="fb-dot" cx={cx(f) - 8} cy={bottom + 32} r={4} />
                            <circle className="fb-dot" cx={cx(f) + 8} cy={bottom + 32} r={4} />
                        </g>
                    ) : (
                        <circle key={`m${f}`} className="fb-dot" cx={cx(f)} cy={bottom + 32} r={4} />
                    )
                )}
            </svg>
        </div>
    );
}