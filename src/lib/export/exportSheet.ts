/** Utilidades de descarga y exportación de la hoja de la canción. */

export function safeFilename(name: string): string {
    const base = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
    return base || 'cancion';
}

export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadText(text: string, filename: string, type = 'application/json'): void {
    downloadBlob(new Blob([text], { type: `${type};charset=utf-8` }), filename);
}

interface Block {
    top: number;
    bottom: number;
    /** true = fila o grupo pequeño: se puede cortar entre ellos si la sección no cabe en una página. */
    fine: boolean;
}

interface Capture {
    dataUrl: string;
    width: number;
    height: number;
    /** Bloques indivisibles, en píxeles relativos al borde superior de la hoja. */
    blocks: Block[];
}

/** Captura el nodo con tema claro y ancho fijo (clase `export-light`). */
async function capture(node: HTMLElement): Promise<Capture> {
    const { toPng } = await import('html-to-image');
    node.classList.add('export-light');
    try {
        await document.fonts?.ready;
        await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

        const box = node.getBoundingClientRect();
        const blocks = Array.from(node.querySelectorAll<HTMLElement>('[data-export-block]')).map((el) => {
            const r = el.getBoundingClientRect();
            return {
                top: r.top - box.top,
                bottom: r.bottom - box.top,
                fine: el.dataset.exportBlock === 'row',
            };
        });

        const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: '#ffffff', cacheBust: true });
        return { dataUrl, width: box.width, height: box.height, blocks };
    } finally {
        node.classList.remove('export-light');
    }
}

export async function exportPng(node: HTMLElement, basename: string): Promise<void> {
    const { dataUrl } = await capture(node);
    const blob = await (await fetch(dataUrl)).blob();
    downloadBlob(blob, `${basename}.png`);
}

/* ---------- PDF ---------- */


function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('No se pudo preparar la imagen del PDF'));
        img.src = src;
    });
}

/**
 * Reparte la altura total en páginas, cortando solo en huecos entre bloques.
 * 1.º intenta no partir ninguna sección; 2.º, si no hay hueco, corta entre filas;
 * 3.º, si una fila es más alta que la página, corta donde llega el límite.
 */
function paginate(total: number, maxH: number, blocks: Block[]): Array<[number, number]> {
    const EPS = 2;

    const bestCut = (start: number, limit: number, pool: Block[]): number | undefined => {
        const isGap = (y: number) => !pool.some((b) => b.top + EPS < y && y < b.bottom - EPS);
        return pool
            .map((b) => b.bottom)
            .filter((y) => y > start + 10 && y <= limit && isGap(y))
            .sort((a, b) => b - a)[0];
    };

    const fine = blocks.filter((b) => b.fine);
    const pages: Array<[number, number]> = [];
    let start = 0;

    while (total - start > maxH) {
        const limit = start + maxH;
        const cut = bestCut(start, limit, blocks) ?? bestCut(start, limit, fine);
        const end = cut ?? limit;
        pages.push([start, end]);

        if (cut === undefined) {
            start = end;
        } else {
            // La siguiente página empieza en el siguiente bloque (sin el hueco)
            const next = blocks
                .map((b) => b.top)
                .filter((t) => t >= end - EPS)
                .sort((a, b) => a - b)[0];
            start = next !== undefined && next < total ? next : end;
        }
    }
    pages.push([start, total]);
    return pages;
}

const PDF = { marginX: 0, top: 24, bottom: 24 } as const;

export async function exportPdf(node: HTMLElement, basename: string): Promise<void> {
    const [shot, { jsPDF }] = await Promise.all([capture(node), import('jspdf')]);
    const img = await loadImage(shot.dataUrl);

    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const contentW = pageW - PDF.marginX * 2;
    const contentH = pageH - PDF.top - PDF.bottom;

    const ratio = contentW / shot.width;
    const scale = img.naturalWidth / shot.width;
    const pages = paginate(shot.height, contentH / ratio, shot.blocks);

    pages.forEach(([from, to], i) => {
        if (i > 0) pdf.addPage();

        const sy = Math.round(from * scale);
        const sh = Math.min(Math.round((to - from) * scale), img.naturalHeight - sy);
        if (sh <= 0) return;

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = sh;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No se pudo preparar el PDF');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, sy, img.naturalWidth, sh, 0, 0, canvas.width, sh);

        pdf.addImage(
            canvas.toDataURL('image/png'), 'PNG',
            PDF.marginX, PDF.top, contentW, (sh / scale) * ratio,
            undefined, 'FAST'
        );
    });

    pdf.save(`${basename}.pdf`);
}