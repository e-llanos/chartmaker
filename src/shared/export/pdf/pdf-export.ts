
import type { jsPDF } from 'jspdf';
import { safeFilename } from '@/shared/export/export-sheet';
import type { PdfChart } from './pdf-chart';
import type { PdfOptions } from './pdf-options';
import { renderChartPdf } from './pdf-render-chart';
import { renderSongPdf } from './pdf-render';
import type { PdfSong } from './pdf-song';

/** Lo que el diálogo necesita para generar y descargar: no sabe si es Cifrado o Chart. */
export interface PdfExport {
    filename: string;
    render: (options: PdfOptions) => Promise<jsPDF>;
}

export const songPdfExport = (song: PdfSong): PdfExport => ({
    filename: safeFilename(song.title),
    render: (o) => renderSongPdf(song, o),
});

export const chartPdfExport = (chart: PdfChart): PdfExport => ({
    filename: safeFilename(chart.title),
    render: (o) => renderChartPdf(chart, o),
});