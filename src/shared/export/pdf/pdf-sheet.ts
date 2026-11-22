import type { jsPDF } from 'jspdf';
import { splitChord } from '@/domain/music/notation/format-chord';
import { fontStyleFor, getPdfFont, registerFonts, type FontStyle } from './pdf-fonts';
import { MARGINS, SPACING, type PdfOptions } from './pdf-options';

export const INK = '#111111';
export const MUTED = '#666666';
export const RULE = '#cfcfcf';
const CARD_LINE = '#d2d2d2';
const CARD_PAD = 10;
const SUP = 0.66; // tamaño relativo de las extensiones (sus2, 7…)

export type PdfLayout = 'columns' | 'list';

export interface SheetHead {
    title: string;
    artist: string;
    meta: string[];
    /** Vista del visor: con `columns`, la opción "Según la vista" usa 2 columnas. */
    layout?: PdfLayout;
}

export interface SectionHead {
    badge: { text: string; color: string };
    label: string;
    note: string;
    repeat: number;
}

/** Una fila ya medida: se dibuja cuando se sabe en qué columna y página cae. */
export interface Row {
    h: number;
    /** No dejar esta fila sola al final de una columna (los encabezados). */
    keepNext?: boolean;
    draw: (x: number, y: number) => void;
}

export interface Sheet {
    pdf: jsPDF;
    o: PdfOptions;
    /** Columnas reales de la página (ya resuelto "Según la vista"). */
    columns: number;
    /** Ancho de una columna. */
    colW: number;
    /** Ancho útil dentro de una tarjeta de sección. */
    innerW: number;
    /** Factor de interlineado según el espaciado elegido. */
    lineH: number;
    chordColor: string;
    useText: (size: number, style?: FontStyle, color?: string) => void;
    useChord: (size: number) => void;
    chordWidth: (chord: string, size?: number) => number;
    drawChord: (chord: string, x: number, baseline: number, size?: number) => void;
    /** Recorta el texto con "..." para que quepa en `maxW` (con la fuente actual). */
    fit: (text: string, maxW: number) => string;
    sectionRow: (s: SectionHead, width?: number) => Row;
    commentRows: (text: string, width?: number) => Row[];
    /** Coloca una sección. Con `card` (por defecto) la enmarca en una tarjeta. */
    place: (rows: Row[], card?: boolean) => void;
    /** Dibuja el pie de página y devuelve el documento. */
    finish: () => jsPDF;
}

/** Mezcla un color #rrggbb con blanco: a=1 es el color puro, a=0 es blanco. */
function tint(hex: string, a: number): string {
    const n = parseInt(hex.slice(1), 16);
    const mix = (c: number) => Math.round(255 - (255 - c) * a);
    return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255]
        .map((c) => mix(c).toString(16).padStart(2, '0'))
        .join('')}`;
}

export async function createSheet(head: SheetHead, o: PdfOptions): Promise<Sheet> {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ unit: 'pt', format: o.paper });
    await registerFonts(pdf, [o.textFont, o.chordFont]);
    pdf.setProperties({ title: head.title, author: head.artist, creator: 'chartmaker' });

    const textFont = getPdfFont(o.textFont);
    const chordFont = getPdfFont(o.chordFont);
    const sp = SPACING[o.spacing];
    const m = MARGINS[o.margin];
    const chordColor = o.color ? o.chordColor : '#000000';

    const columns = o.columns === 'auto' ? (head.layout === 'columns' ? 2 : 1) : o.columns;
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const gutter = 24;
    const colW = (pageW - m * 2 - gutter * (columns - 1)) / columns;
    const innerW = colW - CARD_PAD * 2;
    const bodyBottom = pageH - m;

    const useText = (size: number, style: FontStyle = 'normal', color = INK) => {
        pdf.setFont(textFont.family, fontStyleFor(textFont, style));
        pdf.setFontSize(size);
        pdf.setTextColor(color);
    };
    const useChord = (size: number) => {
        pdf.setFont(chordFont.family, fontStyleFor(chordFont, o.chordBold ? 'bold' : 'normal'));
        pdf.setFontSize(size);
        pdf.setTextColor(chordColor);
    };

    /* ---------- Acordes ---------- */

    const widths = new Map<string, number>();
    const chordWidth = (chord: string, size = o.chordSize): number => {
        const key = `${size.toFixed(2)}|${chord}`;
        let w = widths.get(key);
        if (w === undefined) {
            const { base, sup, bass } = splitChord(chord);
            useChord(size);
            w = pdf.getTextWidth(base);
            if (sup) { useChord(size * SUP); w += pdf.getTextWidth(sup); }
            if (bass) { useChord(size); w += pdf.getTextWidth(bass); }
            widths.set(key, w);
        }
        return w;
    };

    const drawChord = (chord: string, x: number, baseline: number, size = o.chordSize) => {
        const { base, sup, bass } = splitChord(chord);
        useChord(size);
        pdf.text(base, x, baseline);
        x += pdf.getTextWidth(base);
        if (sup) {
            useChord(size * SUP);
            pdf.text(sup, x, baseline - size * 0.34);
            x += pdf.getTextWidth(sup);
        }
        if (bass) {
            useChord(size);
            pdf.text(bass, x, baseline);
        }
    };

    const fit = (text: string, maxW: number): string => {
        if (pdf.getTextWidth(text) <= maxW) return text;
        let t = text;
        while (t.length > 1 && pdf.getTextWidth(`${t}...`) > maxW) t = t.slice(0, -1);
        return `${t.trimEnd()}...`;
    };

    /* ---------- Filas comunes ---------- */

    const spaced = (text: string, x: number, baseline: number, gap: number): number => {
        for (const ch of text) {
            pdf.text(ch, x, baseline);
            x += pdf.getTextWidth(ch) + gap;
        }
        return x;
    };

    const sectionRow = (s: SectionHead, width = innerW): Row => {
        const d = Math.max(18, o.textSize * 1.7);
        const r = d / 2;
        const accent = o.color ? s.badge.color : INK;
        return {
            h: d + 6,
            keepNext: true,
            draw: (x, y) => {
                const cy = y + r;
                const badgeSize = d * 0.4;
                pdf.setDrawColor(accent);
                pdf.setLineWidth(1.2);
                pdf.circle(x + r, cy, r - 0.6, 'S');
                useText(badgeSize, 'bold', accent);
                pdf.text(s.badge.text, x + r, cy + badgeSize * 0.35, { align: 'center' });

                let tx = x + d + 8;
                const base = cy + o.textSize * 0.33;
                if (o.sectionUppercase) {
                    // Mayúsculas con espaciado entre letras (como en pantalla)
                    useText(o.textSize * 0.92, 'bold');
                    tx = spaced(s.label.toUpperCase(), tx, base, 0.9) + 8;
                } else {
                    useText(o.textSize * 1.02, 'bold');
                    pdf.text(s.label, tx, base);
                    tx += pdf.getTextWidth(s.label) + 8;
                }

                if (s.repeat > 1) {
                    const t = `×${s.repeat}`;
                    const size = o.textSize * 0.8;
                    useText(size, 'bold', accent);
                    const ph = o.textSize * 1.25;
                    const pw = pdf.getTextWidth(t) + 10;
                    pdf.setFillColor(o.color ? tint(s.badge.color, 0.16) : '#e8e8e8');
                    pdf.roundedRect(tx, cy - ph / 2, pw, ph, ph / 2, ph / 2, 'F');
                    pdf.text(t, tx + pw / 2, cy + size * 0.35, { align: 'center' });
                    tx += pw + 8;
                }

                if (s.note) {
                    useText(o.textSize * 0.9, 'normal', MUTED);
                    const room = x + width - tx - 4;
                    if (room > 24) pdf.text(fit(s.note, room), x + width, cy + o.textSize * 0.33, { align: 'right' });
                }
            },
        };
    };

    const commentRows = (comment: string, width = innerW): Row[] => {
        const size = o.textSize * 0.9;
        useText(size, 'italic', MUTED);
        return (pdf.splitTextToSize(comment, width) as string[]).map((part) => ({
            h: size * sp.line,
            draw: (x, y) => {
                useText(size, 'italic', MUTED);
                pdf.text(part, x, y + size * 0.85);
            },
        }));
    };

    /* ---------- Cabecera de la canción (primera página) ---------- */

    let ty = m;
    const title = o.titleUppercase ? head.title.toUpperCase() : head.title;
    useText(o.titleSize, 'bold');
    for (const l of pdf.splitTextToSize(title, pageW - m * 2) as string[]) {
        pdf.text(l, m, ty + o.titleSize * 0.85);
        ty += o.titleSize * 1.2;
    }
    if (head.artist) {
        const size = o.titleSize * 0.55;
        useText(size, 'normal', MUTED);
        pdf.text(head.artist, m, ty + size * 0.85);
        ty += size * 1.35;
    }
    if (head.meta.length) {
        const size = o.textSize * 0.9;
        useText(size, 'normal', MUTED);
        ty += 4;
        for (const l of pdf.splitTextToSize(head.meta.join('   |   '), pageW - m * 2) as string[]) {
            pdf.text(l, m, ty + size * 0.85);
            ty += size * 1.4;
        }
    }
    ty += 6;
    pdf.setDrawColor(RULE);
    pdf.setLineWidth(0.8);
    pdf.line(m, ty, pageW - m, ty);
    const headerBottom = ty + 16;

    /* ---------- Colocación en columnas y páginas ---------- */

    let page = 1;
    let col = 0;
    let y = headerBottom;

    const colTop = () => (page === 1 ? headerBottom : m);
    const atTop = () => y <= colTop() + 0.5;
    const nextColumn = () => {
        if (col < columns - 1) col++;
        else {
            pdf.addPage();
            page++;
            col = 0;
        }
        y = colTop();
    };

    const sum = (rows: Row[]) => rows.reduce((s, r) => s + r.h, 0);

    const place = (rows: Row[], card = true) => {
        const pad = card ? CARD_PAD : 0;

        /** Dibuja un trozo de sección (con su tarjeta) en la columna actual. */
        const emit = (chunk: Row[]) => {
            const h = sum(chunk) + pad * 2;
            const x = m + col * (colW + gutter);
            if (card) {
                pdf.setDrawColor(CARD_LINE);
                pdf.setLineWidth(1);
                pdf.roundedRect(x, y, colW, h, 8, 8, 'S');
            }
            let yy = y + pad;
            for (const r of chunk) {
                r.draw(x + pad, yy);
                yy += r.h;
            }
            y += h;
        };

        if (!atTop()) y += sp.section;

        if (o.keepTogether && sum(rows) + pad * 2 <= bodyBottom - colTop()) {
            if (y + sum(rows) + pad * 2 > bodyBottom) nextColumn();
            emit(rows);
            return;
        }

        // Sección que no cabe entera (o sin "no partir"): se reparte; cada trozo lleva su tarjeta.
        let chunk: Row[] = [];
        rows.forEach((r, i) => {
            const need = r.h + (r.keepNext && rows[i + 1] ? rows[i + 1].h : 0);
            if (y + sum(chunk) + need + pad * 2 > bodyBottom) {
                if (chunk.length) {
                    emit(chunk);
                    chunk = [];
                }
                if (!atTop()) nextColumn();
            }
            chunk.push(r);
        });
        if (chunk.length) emit(chunk);
    };

    const finish = (): jsPDF => {
        if (o.pageNumbers) {
            const total = pdf.getNumberOfPages();
            const footY = pageH - Math.max(16, m * 0.5);
            const left = [head.title, head.artist].filter(Boolean).join(' · ');
            for (let i = 1; i <= total; i++) {
                pdf.setPage(i);
                useText(8, 'normal', MUTED);
                pdf.text(left, m, footY);
                pdf.text(`${i} / ${total}`, pageW - m, footY, { align: 'right' });
            }
        }
        return pdf;
    };

    return {
        pdf, o, columns, colW, innerW, lineH: sp.line, chordColor,
        useText, useChord, chordWidth, drawChord, fit,
        sectionRow, commentRows, place, finish,
    };
}