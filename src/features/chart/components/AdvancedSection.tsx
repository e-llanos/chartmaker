import type { CSSProperties } from 'react';
import type { ChartMeasure, ChartSection } from '@/domain/chart/types';
import { chunk } from '@/domain/chart/utils';
import { SECTION_TYPES } from '@/domain/sections/section-types';
import AdvancedRow from './AdvancedRow';

interface AdvancedSectionProps {
    section: ChartSection;
    /** Primera sección de la hoja: lleva el compás en el margen. */
    first: boolean;
    count: number;
    time: { num: string; den: string };
    mapChord: (chord: string) => string;
}

/** Una sección: su cabecera pegada a la primera fila, para que no queden separadas al paginar. */
export default function AdvancedSection({ section: s, first, count, time, mapChord }: AdvancedSectionProps) {
    const rows = chunk(s.measures, s.perRow);

    const head = (
        <div className="score-head">
            <span className="score-label">{s.label || SECTION_TYPES[s.type].label}</span>
            {s.repeat > 1 && <span className="score-repeat">×{s.repeat}</span>}
            {s.note && <span className="score-note">{s.note}</span>}
        </div>
    );

    const renderRow = (row: ChartMeasure[], ri: number) => (
        <AdvancedRow
            key={ri}
            measures={row}
            perRow={s.perRow}
            count={count}
            mapChord={mapChord}
            time={first && ri === 0 ? time : null}
        />
    );

    return (
        <section
            id={`score-${s.id}`}
            data-export-block
            className="score-section"
            style={{ '--c': SECTION_TYPES[s.type].color } as CSSProperties}
        >
            {rows.length === 0 ? (
                <>
                    {head}
                    <p className="line-comment score-empty">Sin compases.</p>
                </>
            ) : (
                <>
                    <div data-export-block="row">
                        {head}
                        {renderRow(rows[0] ?? [], 0)}
                    </div>
                    {rows.slice(1).map((row, k) => renderRow(row, k + 1))}
                </>
            )}
        </section>
    );
}