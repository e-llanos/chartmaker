'use client';

import { useState } from 'react';

/** Qué secciones están desplegadas, por id. */
export function useAccordion(initialOpen: string[] = []) {
    const [open, setOpen] = useState<Set<string>>(() => new Set(initialOpen));

    return {
        isOpen: (id: string) => open.has(id),
        toggle: (id: string) =>
            setOpen((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
            }),
        /** Abre una sección sin cerrar las demás (por ejemplo, la recién creada). */
        show: (id: string) => setOpen((prev) => new Set(prev).add(id)),
        /** Deja abiertas exactamente estas secciones. */
        set: (ids: string[]) => setOpen(new Set(ids)),
        collapseAll: () => setOpen(new Set()),
    };
}