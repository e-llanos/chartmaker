export type BarIconKind = 'single' | 'double' | 'repeat-start' | 'repeat-end' | 'final';

const SHAPES: Record<BarIconKind, React.ReactNode> = {
    single: <path d="M12 5v14" />,
    double: <path d="M10 5v14M14 5v14" />,
    'repeat-start': (
        <>
            <path d="M7 5v14" strokeWidth={3.5} />
            <path d="M11 5v14" />
            <circle cx="15" cy="10" r="1.2" fill="currentColor" />
            <circle cx="15" cy="14" r="1.2" fill="currentColor" />
        </>
    ),
    'repeat-end': (
        <>
            <circle cx="9" cy="10" r="1.2" fill="currentColor" />
            <circle cx="9" cy="14" r="1.2" fill="currentColor" />
            <path d="M13 5v14" />
            <path d="M17 5v14" strokeWidth={3.5} />
        </>
    ),
    final: (
        <>
            <path d="M10 5v14" />
            <path d="M15 5v14" strokeWidth={3.5} />
        </>
    ),
};

/** Dibujo de una barra de compás, para los botones del editor. */
export default function BarIcon({ kind }: { kind: BarIconKind }) {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {SHAPES[kind]}
        </svg>
    );
}