'use client';

import { useState, useContext, type RefObject } from 'react';
import { LuFileMusic, LuFileText, LuImage } from 'react-icons/lu';
import { CHARTMAKER_EXT, serializeChartmaker } from '@/domain/song/chartmaker';
import type { SongCreate } from '@/domain/song/types';
import { downloadText, exportPdf, exportPng, safeFilename } from '@/shared/export/export-sheet';
import { PdfExportContext } from '@/shared/export/pdf/PdfExportContext';

type ExportKind = 'pdf' | 'png' | 'chartmaker';

const OPTIONS = [
    { kind: 'pdf', label: 'Descargar PDF', ext: '.pdf', Icon: LuFileText },
    { kind: 'png', label: 'Descargar imagen', ext: '.png', Icon: LuImage },
    { kind: 'chartmaker', label: 'Exportar canción', ext: CHARTMAKER_EXT, Icon: LuFileMusic },
] as const;

interface ExportListProps {
    /** Nodo que contiene la hoja a capturar (PDF y PNG). */
    sheetRef: RefObject<HTMLElement | null>;
    /** Datos de la canción (archivo .chartmaker y nombre del archivo). */
    song: SongCreate;
}

export default function ExportList({ sheetRef, song }: ExportListProps) {
    const [busy, setBusy] = useState<ExportKind | null>(null);
    const [error, setError] = useState<string | null>(null);
    const openPdf = useContext(PdfExportContext);

    async function run(kind: ExportKind, dialog: HTMLDialogElement | null) {
        // PDF con exportador propio: cierra las preferencias y abre sus opciones. No captura nada.
        if (kind === 'pdf' && openPdf) {
            dialog?.close();
            openPdf();
            return;
        }

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
                else await exportPdf(node, base); // solo si el visor no tiene exportador propio
            }
            dialog?.close();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo exportar');
        } finally {
            setBusy(null);
        }
    }

    return (
        <>
            {OPTIONS.map(({ kind, label, ext, Icon }) => (
                <button
                    key={kind}
                    type="button"
                    className="pref-row pref-action"
                    disabled={busy !== null}
                    onClick={(e) => run(kind, e.currentTarget.closest('dialog'))}
                >
                    <span className="pref-label">
                        <Icon size={18} aria-hidden="true" />
                        {busy === kind ? 'Exportando…' : label}
                    </span>
                    <small>{ext}</small>
                </button>
            ))}
            {error && <p role="alert" className="form-error pref-error">{error}</p>}
        </>
    );
}