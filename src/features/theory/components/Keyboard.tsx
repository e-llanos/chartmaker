import { preferFlatsFor } from '@/domain/theory/instruments';
import { formatNote, type NameStyle, type SpelledNote, pitchName } from '@/domain/music/core';

const W = 34;
const H = 118;
const BW = 22;
const BH = 72;
const WHITE = [0, 2, 4, 5, 7, 9, 11];
const BLACK = [{ pc: 1, after: 0 }, { pc: 3, after: 1 }, { pc: 6, after: 3 }, { pc: 8, after: 4 }, { pc: 10, after: 5 }];

interface KeyboardProps {
    /** Notas a resaltar; la primera es la tónica. Con null no se resalta nada. */
    notes: SpelledNote[] | null;
    style: NameStyle;
    octaves?: number;
    /** Octava de la primera C (para los nombres con número: C3, C4…). */
    startOctave?: number;
    showOctave?: boolean;
    /** Escribe el nombre en todas las teclas, no solo en las resaltadas. */
    allNames?: boolean;
}

/** Teclado con las notas resaltadas. */
export default function Keyboard({
    notes, style, octaves = 2, startOctave = 3, showOctave = false, allNames = false,
}: KeyboardProps) {
    const byPc = new Map<number, SpelledNote>();
    for (const n of notes ?? []) if (!byPc.has(n.pc)) byPc.set(n.pc, n);
    const rootPc = notes?.[0]?.pc;
    const flats = preferFlatsFor(notes);

    const state = (pc: number) => (byPc.has(pc) ? (pc === rootPc ? ' root' : ' on') : '');

    /** Líneas de texto de una tecla (las negras sin resaltar muestran sostenido y bemol). */
    function lines(pc: number, octave: number): string[] {
        const suffix = showOctave ? String(octave) : '';
        const n = byPc.get(pc);
        if (n) return [formatNote(n.name, style) + suffix];
        if (!allNames) return [];
        const sharp = pitchName(pc, false);
        const flat = pitchName(pc, true);
        if (!notes && sharp !== flat) return [formatNote(sharp, style) + suffix, formatNote(flat, style) + suffix];
        return [formatNote(pitchName(pc, flats), style) + suffix];
    }

    return (
        <svg className="kb" style={{ maxWidth: octaves * 280 }} viewBox={`0 0 ${W * 7 * octaves} ${H}`}
            role="img" aria-label="Teclado con las notas resaltadas">
            {Array.from({ length: octaves }, (_, o) =>
                WHITE.map((pc, i) => {
                    const x = (o * 7 + i) * W;
                    const text = lines(pc, startOctave + o);
                    const lit = byPc.has(pc);
                    return (
                        <g key={`w${o}-${i}`}>
                            <rect className={`kb-white${state(pc)}`} x={x} y={0} width={W} height={H} rx={3} />
                            {text.map((t) => (
                                <text key={t} className={`kb-label${lit ? '' : ' dark'}`} x={x + W / 2} y={H - 8} textAnchor="middle">{t}</text>
                            ))}
                        </g>
                    );
                })
            )}
            {Array.from({ length: octaves }, (_, o) =>
                BLACK.map(({ pc, after }) => {
                    const x = (o * 7 + after + 1) * W - BW / 2;
                    const text = lines(pc, startOctave + o);
                    const lit = byPc.has(pc);
                    return (
                        <g key={`b${o}-${pc}`}>
                            <rect className={`kb-black${state(pc)}`} x={x} y={0} width={BW} height={BH} rx={3} />
                            {text.map((t, k) => (
                                <text key={t} className={`kb-label sm${lit ? '' : ' lite'}`} x={x + BW / 2}
                                    y={text.length === 2 ? BH - 22 + k * 11 : BH - 8} textAnchor="middle">{t}</text>
                            ))}
                        </g>
                    );
                })
            )}
        </svg>
    );
}