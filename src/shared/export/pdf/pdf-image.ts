import type { jsPDF } from 'jspdf';
import { loadPdfjs } from './pdfjs';

/** Lado máximo seguro de un canvas en los navegadores. */
const MAX_SIDE = 16000;

/** Une todas las páginas del PDF, una debajo de otra, en un solo PNG. `scale` 2 ≈ 144 ppp. */
export async function pdfToPng(doc: jsPDF, scale = 2): Promise<Blob> {
    const pdfjs = await loadPdfjs();
    const task = pdfjs.getDocument({ data: new Uint8Array(doc.output('arraybuffer')) });
    const pdf = await task.promise;
    try {
        const base = (await pdf.getPage(1)).getViewport({ scale: 1 });
        // Todas las páginas miden lo mismo; si son muchas, baja la escala para no pasar el límite.
        const s = Math.min(scale, MAX_SIDE / (base.height * pdf.numPages));
        const pageW = Math.ceil(base.width * s);
        const pageH = Math.ceil(base.height * s);

        const out = document.createElement('canvas');
        out.width = pageW;
        out.height = pageH * pdf.numPages;
        const ctx = out.getContext('2d');
        if (!ctx) throw new Error('No se pudo crear la imagen');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, out.width, out.height);

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: s });
            const tmp = document.createElement('canvas');
            tmp.width = Math.ceil(viewport.width);
            tmp.height = Math.ceil(viewport.height);
            await page.render({ canvas: tmp, viewport }).promise;
            ctx.drawImage(tmp, 0, (i - 1) * pageH);
        }

        return await new Promise<Blob>((resolve, reject) =>
            out.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo crear la imagen'))), 'image/png')
        );
    } finally {
        void task.destroy();
    }
}