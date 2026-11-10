import type { ReactNode } from 'react';

interface SpellingNoticeProps {
    /** Explicación del aviso. */
    children: ReactNode;
    /** Texto del botón que cambia a la escritura más simple. */
    actionLabel: string;
    onAction: () => void;
}

/** Aviso didáctico: una escritura teórica es correcta, pero en la práctica se usa su equivalente. */
export default function SpellingNotice({ children, actionLabel, onAction }: SpellingNoticeProps) {
    return (
        <div className="th-notice" role="note">
            <svg className="th-notice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
            </svg>
            <p>{children}</p>
            <button type="button" className="th-notice-action" onClick={onAction}>{actionLabel}</button>
        </div>
    );
}
