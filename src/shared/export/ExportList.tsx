'use client';

import { useContext, useState, type RefObject } from 'react';
import { LuChevronRight, LuPrinter } from 'react-icons/lu';
import type { SongCreate } from '@/domain/song/types';
import { exportPdf, safeFilename } from '@/shared/export/export-sheet';
import { PdfExportContext } from '@/shared/export/pdf/PdfExportContext';

interface ExportListProps {
    /** Nodo de la hoja: solo se usa si el visor no tiene exportador propio. */
    sheetRef: RefObject<HTMLElement | null>;
    song: SongCreate;
}

export default function ExportList({ sheetRef, song }: ExportListProps) {
    const openExport = useContext(PdfExportContext);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function run(dialog: HTMLDialogElement | null) {
        if (openExport) {
            dialog?.close();
            openExport();
            return;
        }

        // Respaldo: visor sin exportador propio
        setError(null);
        setBusy(true);
        try {
            const node = sheetRef.current;
            if (!node) throw new Error('No hay contenido para exportar');
            await exportPdf(node, safeFilename(song.title));
            dialog?.close();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo exportar');
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <button
                type="button"
                className="pref-row pref-action"
                disabled={busy}
                onClick={(e) => run(e.currentTarget.closest('dialog'))}
            >
                <span className="pref-label">
                    <LuPrinter size={18} aria-hidden="true" />
                    {busy ? 'Exportando…' : 'Exportar canción'}
                </span>
                <LuChevronRight size={16} className="pref-chevron" aria-hidden="true" />
            </button>
            {error && <p role="alert" className="form-error pref-error">{error}</p>}
        </>
    );
}