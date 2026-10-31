'use client';

import { useState } from 'react';
import type { SectionDrag } from './SectionPanel';

/** Reordena una lista arrastrando. `props(i)` devuelve lo que necesita cada sección. */
export function useReorder<T>(items: T[], onReorder: (next: T[]) => void) {
    const [from, setFrom] = useState<number | null>(null);
    const [over, setOver] = useState<number | null>(null);

    const reset = () => {
        setFrom(null);
        setOver(null);
    };

    return {
        props: (index: number): SectionDrag => ({
            dragging: from === index,
            over: over === index && from !== null && from !== index,
            onStart: () => setFrom(index),
            onEnter: () => setOver(index),
            onDrop: () => {
                if (from !== null && from !== index) {
                    const next = [...items];
                    const [moved] = next.splice(from, 1);
                    if (moved !== undefined) {
                        next.splice(index, 0, moved);
                        onReorder(next);
                    }
                }
                reset();
            },
            onEnd: reset,
        }),
    };
}