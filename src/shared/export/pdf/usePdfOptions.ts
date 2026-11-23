'use client';

import { useCallback, useState } from 'react';
import { PDF_DEFAULTS, sanitizePdfOptions, type PdfOptions } from './pdf-options';

const KEY = 'chartmaker:pdf-options';

function load(): PdfOptions {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? sanitizePdfOptions(JSON.parse(raw)) : PDF_DEFAULTS;
    } catch {
        return PDF_DEFAULTS;
    }
}

/** Opciones del PDF recordadas en este navegador. Úsalo solo en componentes que montan en el cliente. */
export function usePdfOptions() {
    const [options, setOptions] = useState<PdfOptions>(load);

    const update = useCallback((patch: Partial<PdfOptions>) => {
        setOptions((prev) => {
            const next = sanitizePdfOptions({ ...prev, ...patch });
            try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* sin almacenamiento */ }
            return next;
        });
    }, []);

    const reset = useCallback(() => {
        try { localStorage.removeItem(KEY); } catch { /* sin almacenamiento */ }
        setOptions(PDF_DEFAULTS);
    }, []);

    return { options, update, reset };
}