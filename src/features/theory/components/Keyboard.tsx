import { formatNote, type NameStyle, type SpelledNote } from '@/domain/theory/notes';

const W = 34;
const H = 118;
const BW = 22;
const BH = 72;
const OCTAVES = 2;
const WHITE = [0, 2, 4, 5, 7, 9, 11];
const BLACK = [{ pc: 1, after: 0 }, { pc: 3, after: 1 }, { pc: 6, after: 3 }, { pc: 8, after: 4 }, { pc: 10, after: 5 }];

interface KeyboardProps {
    /** Notas a resaltar; la primera es la tónica. */
    notes: SpelledNote[];
    style: NameStyle;
}

/** Teclado de dos octavas con las notas resaltadas. */
export default function Keyboard({ notes, style }: KeyboardProps) {
    const byPc = new Map<number, SpelledNote>();
    for (const n of notes) if (!byPc.has(n.pc)) byPc.set(n.pc, n);
    const rootPc = notes[0]?.pc;

    const state = (pc: number) => (byPc.has(pc) ? (pc === rootPc ? ' root' : ' on') : '');
    const label = (pc: number) => {
        const n = byPc.get(pc);
        return n ? formatNote(n.name, style) : null;
    };

    return (
        <svg className="kb" viewBox={`0 0 ${W * 7 * OCTAVES} ${H}`} role="img"
            aria-label="Teclado con las notas de la escala resaltadas">
            {Array.from({ length: OCTAVES }, (_, o) =>
                WHITE.map((pc, i) => {
                    const x = (o * 7 + i) * W;
                    const text = label(pc);
                    return (
                        <g key={`w${o}-${i}`}>
                            <rect className={`kb-white${state(pc)}`} x={x} y={0} width={W} height={H} rx={3} />
                            {text && <text className="kb-label" x={x + W / 2} y={H - 8} textAnchor="middle">{text}</text>}
                        </g>
                    );
                })
            )}
            {Array.from({ length: OCTAVES }, (_, o) =>
                BLACK.map(({ pc, after }) => {
                    const x = (o * 7 + after + 1) * W - BW / 2;
                    const text = label(pc);
                    return (
                        <g key={`b${o}-${pc}`}>
                            <rect className={`kb-black${state(pc)}`} x={x} y={0} width={BW} height={BH} rx={3} />
                            {text && <text className="kb-label" x={x + BW / 2} y={BH - 8} textAnchor="middle">{text}</text>}
                        </g>
                    );
                })
            )}
        </svg>
    );
}