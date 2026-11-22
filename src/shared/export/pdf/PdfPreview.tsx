'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PdfExport } from './pdf-export';
import type { PdfOptions } from './pdf-options';

interface PdfPreviewProps {
    pdf: PdfExport;
    options: PdfOptions;
    /** false = no genera nada (pestaña oculta en móvil). */
    active: boolean;
    onError: (message: string | null) => void;
}

/** Relleno lateral del panel (debe coincidir con .pdf-preview-scroll en el CSS). */
const PAD = 16;

type Pdfjs = typeof import('pdfjs-dist');
let pdfjsPromise: Promise<Pdfjs> | null = null;

function loadPdfjs(): Promise<Pdfjs> {
    pdfjsPromise ??= import('pdfjs-dist').then((lib) => {
        lib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        return lib;
    });
    return pdfjsPromise;
}

/**
 * Vista previa sin parpadeo: genera el PDF, dibuja cada página en un canvas fuera de pantalla
 * y reemplaza las páginas de una sola vez. Si llegan cambios mientras trabaja, solo repite
 * con los últimos (no encola uno por cada clic).
 */
export default function PdfPreview({ pdf, options, active, onError }: PdfPreviewProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);

    const latest = useRef({ pdf, options });
    const bytes = useRef<Uint8Array | null>(null);
    const stale = useRef(true);
    const busy = useRef(false);
    const dirty = useRef(false);
    const alive = useRef(true);
    const report = useRef(onError);

    useEffect(() => {
        report.current = onError;
    }, [onError]);

    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false;
        };
    }, []);

    const paint = useCallback(async (data: Uint8Array) => {
        const host = hostRef.current;
        if (!host || host.clientWidth === 0) return;

        const pdfjs = await loadPdfjs();
        // pdf.js se queda con el buffer: se le pasa una copia para poder repintar al redimensionar.
        const task = pdfjs.getDocument({ data: data.slice() });
        const doc = await task.promise;
        try {
            const cssWidth = host.clientWidth - PAD * 2;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const canvases: HTMLCanvasElement[] = [];

            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                const scale = (cssWidth / page.getViewport({ scale: 1 }).width) * dpr;
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                canvas.width = Math.ceil(viewport.width);
                canvas.height = Math.ceil(viewport.height);
                canvas.className = 'pdf-page';
                await page.render({ canvas, viewport }).promise;
                canvases.push(canvas);
            }
            if (alive.current) host.replaceChildren(...canvases);
        } finally {
            void task.destroy();
        }
    }, []);

    const run = useCallback(async () => {
        if (busy.current) {
            dirty.current = true;
            return;
        }
        busy.current = true;
        try {
            do {
                dirty.current = false;
                if (stale.current || !bytes.current) {
                    stale.current = false;
                    const { pdf, options } = latest.current;
                    const doc = await pdf.render(options);
                    bytes.current = new Uint8Array(doc.output('arraybuffer'));
                }
                await paint(bytes.current);
                if (alive.current) {
                    setReady(true);
                    report.current(null);
                }
            } while (dirty.current && alive.current);
        } catch (e) {
            stale.current = true;
            if (alive.current) report.current(e instanceof Error ? e.message : 'No se pudo generar la vista previa');
        } finally {
            busy.current = false;
        }
    }, [paint]);

    // Cambió el documento o las opciones: regenerar.
    useEffect(() => {
        latest.current = { pdf, options };
        stale.current = true;
        if (active) void run();
    }, [pdf, options, active, run]);

    // Cambió el ancho del panel: repintar a la nueva escala sin regenerar el PDF.
    useEffect(() => {
        const host = hostRef.current;
        if (!host || !active) return;
        let timer: ReturnType<typeof setTimeout>;
        let last = host.clientWidth;
        const observer = new ResizeObserver(() => {
            if (Math.abs(host.clientWidth - last) < 8) return;
            last = host.clientWidth;
            clearTimeout(timer);
            timer = setTimeout(() => void run(), 150);
        });
        observer.observe(host);
        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [active, run]);

    return (
        <div className="pdf-preview" aria-label="Vista previa">
            <div ref={hostRef} className="pdf-preview-scroll" />
            {!ready && <p className="pdf-preview-state">Generando vista previa…</p>}
        </div>
    );
}