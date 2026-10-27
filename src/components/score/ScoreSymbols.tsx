import type { BarKind } from '@/lib/score/score.utils';
import { MEASURE_MARKS, type MeasureMark } from '@/lib/score/score.types';

/* ---------- Barras de compás ---------- */

export function Bar({ kind }: { kind: BarKind }) {
    switch (kind) {
        case 'double':
            return <span className="bar"><i className="bar-line thin" /><i className="bar-line thin" /></span>;
        case 'final':
            return <span className="bar"><i className="bar-line thin" /><i className="bar-line thick" /></span>;
        case 'repeat-start':
            return <span className="bar"><i className="bar-line thick" /><i className="bar-line thin" /><i className="bar-dots" /></span>;
        case 'repeat-end':
            return <span className="bar"><i className="bar-dots" /><i className="bar-line thin" /><i className="bar-line thick" /></span>;
        case 'repeat-both':
            return <span className="bar"><i className="bar-dots" /><i className="bar-line thin" /><i className="bar-line thin" /><i className="bar-dots" /></span>;
        default:
            return <span className="bar"><i className="bar-line thin" /></span>;
    }
}

/* ---------- Símbolos ---------- */

const svg = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
};

export function SegnoIcon() {
    return (
        <svg className="sym" viewBox="0 0 24 28" {...svg}>
            <path d="M16 5c-1.5-2.5-6-2.5-6.5.8-.4 3 3.8 3.8 6 6.2 2.5 2.7 1 7-3 7-2.4 0-3.8-1.6-3.6-3.2" />
            <path d="M19 3 5 25" />
            <circle cx="6" cy="9" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="18" cy="19" r="1.4" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function CodaIcon() {
    return (
        <svg className="sym" viewBox="0 0 24 28" {...svg}>
            <circle cx="12" cy="14" r="6.5" />
            <path d="M12 3v22M2.5 14h19" />
        </svg>
    );
}

export function FermataIcon() {
    return (
        <svg className="sym sym-wide" viewBox="0 0 24 18" {...svg}>
            <path d="M3 15a9 9 0 0 1 18 0" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function SimileIcon() {
    return (
        <svg className="sym sym-big" viewBox="0 0 24 24" {...svg}>
            <path d="M5 20 19 4" />
            <circle cx="6.5" cy="6.5" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="17.5" cy="17.5" r="1.8" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function MarkView({ mark }: { mark: MeasureMark }) {
    if (mark === 'segno') return <SegnoIcon />;
    if (mark === 'coda') return <CodaIcon />;
    if (mark === 'fermata') return <FermataIcon />;
    return <span className="sm-mark-text">{MEASURE_MARKS[mark]}</span>;
}