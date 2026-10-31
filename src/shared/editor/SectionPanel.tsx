'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { Badge } from '@/domain/sections/section-types';
import { ChevronDownIcon, GripIcon } from '@/shared/ui/Icons';
import SectionBadge from '@/shared/viewer/SectionBadge';

interface SummaryOptions {
    /** Si se indica, se muestra en lugar de la anotación (ej. "4 por fila"). */
    perRow?: number;
    /** Muestra siempre las repeticiones, aunque sea ×1. */
    showRepeat?: boolean;
}

/** Resumen de una línea: "4 compases · ×2 · Pad & Piano". */
export function sectionSummary(
    measures: number,
    repeat: number,
    note: string,
    { perRow, showRepeat = false }: SummaryOptions = {},
): string {
    return [
        `${measures} ${measures === 1 ? 'compás' : 'compases'}`,
        repeat > 1 || showRepeat ? `×${repeat}` : '',
        perRow ? `${perRow} por fila` : note.trim(),
    ].filter(Boolean).join(' · ');
}

/** Estado y manejadores para reordenar arrastrando (ver useReorder). */
export interface SectionDrag {
    dragging: boolean;
    over: boolean;
    onStart: () => void;
    onEnter: () => void;
    onDrop: () => void;
    onEnd: () => void;
}

interface SectionPanelProps {
    badge: Badge;
    title: string;
    summary: string;
    open: boolean;
    onToggle: () => void;
    drag?: SectionDrag;
    children: ReactNode;
}

/** Sección plegable: cabecera de una línea y cuerpo que solo se monta al abrirla. */
export default function SectionPanel({ badge, title, summary, open, onToggle, drag, children }: SectionPanelProps) {
    const classes = ['acc', open && 'open', drag?.dragging && 'dragging', drag?.over && 'drop-target']
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className={classes}
            style={{ '--c': badge.color } as CSSProperties}
            onDragOver={drag ? (e) => e.preventDefault() : undefined}
            onDragEnter={drag ? () => drag.onEnter() : undefined}
            onDrop={drag ? (e) => { e.preventDefault(); drag.onDrop(); } : undefined}
        >
            <div className="acc-head">
                {drag && (
                    <span
                        className="acc-grip"
                        draggable
                        title="Arrastrar para reordenar"
                        aria-hidden="true"
                        onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', title);
                            const card = e.currentTarget.closest('.acc');
                            if (card instanceof HTMLElement) e.dataTransfer.setDragImage(card, 16, 16);
                            drag.onStart();
                        }}
                        onDragEnd={() => drag.onEnd()}
                    >
                        <GripIcon />
                    </span>
                )}
                <button type="button" className="acc-toggle" onClick={onToggle} aria-expanded={open}>
                    <SectionBadge text={badge.text} color={badge.color} small />
                    <span className="acc-title">
                        <strong>{title}</strong>
                        <small>{summary}</small>
                    </span>
                    <span className="acc-chevron" aria-hidden="true"><ChevronDownIcon /></span>
                </button>
            </div>
            {open && <div className="acc-body">{children}</div>}
        </div>
    );
}