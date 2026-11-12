import { FUNCTION_LABELS, type ChordInfo, type DiatonicChord } from '@/domain/music/theory/chords';
import { formatChordSymbol, formatNote, type NameStyle } from '@/domain/music/core';

function ChordCells({ info, style }: { info: ChordInfo | null; style: NameStyle }) {
    if (!info) {
        return (
            <>
                <td className="th-dim">—</td>
                <td className="th-dim">—</td>
            </>
        );
    }
    return (
        <>
            <td>
                <strong>{formatChordSymbol(info.symbol, style)}</strong>
                <span className="th-dim"> {info.roman}</span>
            </td>
            <td className="th-dim">{info.notes.map((n) => formatNote(n, style)).join(' – ')}</td>
        </>
    );
}

interface DiatonicTableProps {
    chords: DiatonicChord[];
    style: NameStyle;
}

/** Acordes de cada grado: tríada y cuatríada, con su número romano y su función. */
export default function DiatonicTable({ chords, style }: DiatonicTableProps) {
    return (
        <div className="th-table-wrap">
            <table className="th-table">
                <thead>
                    <tr>
                        <th>Grado</th>
                        <th>Tríada</th>
                        <th>Notas</th>
                        <th>Cuatríada</th>
                        <th>Notas</th>
                        <th>Función</th>
                    </tr>
                </thead>
                <tbody>
                    {chords.map((c) => (
                        <tr key={c.degree}>
                            <td>{c.degree}</td>
                            <ChordCells info={c.triad} style={style} />
                            <ChordCells info={c.seventh} style={style} />
                            <td>
                                {c.fn ? <span className={`th-chip fn-${c.fn}`}>{FUNCTION_LABELS[c.fn]}</span> : <span className="th-dim">—</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}