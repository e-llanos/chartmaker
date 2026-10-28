'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { SongCreate } from '@/domain/song/types';
import { CHARTMAKER_EXT, serializeChartmaker } from '@/domain/song/chartmaker';
import { downloadText, exportPdf, exportPng, safeFilename } from '@/shared/export/export-sheet';

type ExportKind = 'pdf' | 'png' | 'chartmaker';

interface ExportMenuProps {
    /** Nodo que contiene la hoja a capturar (PDF y PNG). */
    sheetRef: RefObject<HTMLElement | null>;
    /** Datos de la canción (archivo .chartmaker y nombre del archivo). */
    song: SongCreate;
}

export default function ExportMenu({ sheetRef, song }: ExportMenuProps) {
    const menuRef = useRef<HTMLDetailsElement>(null);
    const [busy, setBusy] = useState<ExportKind | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Cierra el menú al hacer clic fuera.
    useEffect(() => {
        function onDown(e: MouseEvent) {
            const el = menuRef.current;
            if (el?.open && !el.contains(e.target as Node)) el.open = false;
        }
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, []);

    async function run(kind: ExportKind) {
        if (menuRef.current) menuRef.current.open = false;
        setError(null);
        setBusy(kind);
        const base = safeFilename(song.title);
        try {
            if (kind === 'chartmaker') {
                downloadText(serializeChartmaker(song), `${base}${CHARTMAKER_EXT}`);
            } else {
                const node = sheetRef.current;
                if (!node) throw new Error('No hay contenido para exportar');
                if (kind === 'png') await exportPng(node, base);
                else await exportPdf(node, base);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo exportar');
        } finally {
            setBusy(null);
        }
    }

    return (
        <div className="menu-wrap">
            <details ref={menuRef} className="menu">
                <summary aria-label="Descargar" title="Descargar">
                    {busy ? (
                        <span aria-hidden="true">…</span>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 3v12" />
                            <path d="m7 11 5 5 5-5" />
                            <path d="M5 21h14" />
                        </svg>
                    )}
                </summary>
                <div className="menu-list" role="menu">
                    <button type="button" role="menuitem" disabled={busy !== null} onClick={() => run('pdf')}>
                        Descargar PDF <small>.pdf</small>
                    </button>
                    <button type="button" role="menuitem" disabled={busy !== null} onClick={() => run('png')}>
                        Descargar imagen <small>.png</small>
                    </button>
                    <button type="button" role="menuitem" disabled={busy !== null} onClick={() => run('chartmaker')}>
                        Exportar canción <small>{CHARTMAKER_EXT}</small>
                    </button>
                </div>
            </details>
            {error && <p role="alert" className="form-error menu-error">{error}</p>}
        </div>
    );
}