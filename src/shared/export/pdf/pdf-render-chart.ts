
import type { jsPDF } from 'jspdf';
import { MEASURE_MARKS, type ChartMeasure, type MeasureMark } from '@/domain/chart/types';
import { barBetween, chunk, segments, type BarKind } from '@/domain/chart/utils';
import type { PdfChart, PdfChartSection } from './pdf-chart';
import type { PdfOptions } from './pdf-options';
import { createSheet, INK, MUTED, type Row } from './pdf-sheet';

const LINE = '#444444';
const FAINT = '#bbbbbb';
const BOX_GAP = 6;
const GUTTER = 22; // margen izquierdo del estilo avanzado (compás)
const LEFT_MARKS: MeasureMark[] = ['segno', 'coda'];
const CENTER_MARKS: MeasureMark[] = ['fermata'];

export async function renderChartPdf(chart: PdfChart, o: PdfOptions): Promise<jsPDF> {
    const sh = await createSheet(chart, o);
    const { pdf, colW, innerW, useText, chordWidth, drawChord } = sh;
    const size = o.chordSize * 1.15;

    /* ---------- Primitivas ---------- */

    const vline = (x: number, y1: number, y2: number, w: number, color = INK) => {
        pdf.setDrawColor(color);
        pdf.setLineWidth(w);
        pdf.line(x, y1, x, y2);
    };
    const hline = (x1: number, x2: number, y: number, w: number, color = INK) => {
        pdf.setDrawColor(color);
        pdf.setLineWidth(w);
        pdf.line(x1, y, x2, y);
    };
    const dot = (x: number, y: number, r: number) => {
        pdf.setFillColor(INK);
        pdf.circle(x, y, r, 'F');
    };

    /** Acorde centrado en una casilla; se encoge si no cabe. Vacío = marca tenue. */
    const centered = (chord: string, x: number, w: number, midY: number, fs: number, empty: string) => {
        if (!chord) {
            useText(fs, 'normal', MUTED);
            pdf.text(empty, x + w / 2, midY + fs * 0.3, { align: 'center' });
            return;
        }
        const k = Math.min(1, Math.max(0.55, (w - 6) / chordWidth(chord, fs)));
        const s2 = fs * k;
        drawChord(chord, x + (w - chordWidth(chord, s2)) / 2, midY + s2 * 0.35, s2);
    };

    /* ---------- Estilo simple: rejilla de cajas ---------- */

    const drawBox = (m: ChartMeasure, x: number, y: number, w: number, h: number, s: PdfChartSection) => {
        pdf.setDrawColor(LINE);
        pdf.setLineWidth(1);
        pdf.roundedRect(x, y, w, h, 3, 3, 'S');

        const parts = segments(m.beats);
        const total = parts.reduce((n, p) => n + p.span, 0);
        let cx = x;
        parts.forEach((p, i) => {
            const pw = (w * p.span) / total;
            if (i > 0) vline(cx, y + 1, y + h - 1, 0.6, FAINT);
            centered(p.chord, cx, pw, y + h / 2, size, '·');
            cx += pw;
        });

        const rep = m.repeat ?? 1;
        if (rep > 1) {
            pdf.setFillColor(o.color ? s.badge.color : LINE);
            pdf.roundedRect(x + w - 22, y - 6, 26, 11, 5.5, 5.5, 'F');
            useText(7, 'bold', '#ffffff');
            pdf.text(`×${rep}`, x + w - 9, y + 2, { align: 'center' });
        }
    };

    const gridRows = (s: PdfChartSection): Row[] => {
        const per = sh.columns === 2 ? 2 : 4;
        const bw = (innerW - BOX_GAP * (per - 1)) / per;
        const bh = Math.max(34, o.chordSize * 2.4);
        return chunk(s.measures, per).map((group): Row => ({
            h: bh + BOX_GAP + 6,
            draw: (x, y) => group.forEach((m, i) => drawBox(m, x + i * (bw + BOX_GAP), y + 6, bw, bh, s)),
        }));
    };

    /* ---------- Estilo avanzado: compases con barras y símbolos ---------- */

    const bar = (x: number, kind: BarKind, y1: number, y2: number) => {
        const dots = (dx: number) => {
            dot(dx, y1 + (y2 - y1) * 0.36, 1.2);
            dot(dx, y1 + (y2 - y1) * 0.64, 1.2);
        };
        switch (kind) {
            case 'double':
                vline(x - 1.5, y1, y2, 0.9); vline(x + 1.5, y1, y2, 0.9);
                break;
            case 'final':
                vline(x - 2.5, y1, y2, 0.9); vline(x + 1, y1, y2, 3);
                break;
            case 'repeat-start':
                vline(x - 1, y1, y2, 3); vline(x + 3, y1, y2, 0.9); dots(x + 7);
                break;
            case 'repeat-end':
                dots(x - 7); vline(x - 3, y1, y2, 0.9); vline(x + 1, y1, y2, 3);
                break;
            case 'repeat-both':
                dots(x - 7); vline(x - 2.5, y1, y2, 0.9); vline(x + 2.5, y1, y2, 0.9); dots(x + 7);
                break;
            default:
                vline(x, y1, y2, 0.9);
        }
    };

    const markWidth = (mark: MeasureMark): number => {
        if (mark === 'segno' || mark === 'coda') return 14;
        if (mark === 'fermata') return 16;
        useText(8.5, 'bolditalic');
        return pdf.getTextWidth(MEASURE_MARKS[mark]);
    };

    /** `x` es el borde izquierdo del símbolo y `b` la línea base. */
    const drawMark = (mark: MeasureMark, x: number, b: number) => {
        if (mark === 'segno') {
            useText(13, 'bold');
            pdf.text('§', x, b);
        } else if (mark === 'coda') {
            const cy = b - 5.5;
            pdf.setDrawColor(INK);
            pdf.setLineWidth(1);
            pdf.circle(x + 7, cy, 4.5, 'S');
            hline(x, x + 14, cy, 1);
            vline(x + 7, b - 12, b + 1, 1);
        } else if (mark === 'fermata') {
            const cx = x + 8;
            const cy = b - 1;
            let px = cx - 7;
            let py = cy;
            for (let i = 1; i <= 12; i++) {
                const a = (Math.PI * i) / 12;
                const nx = cx - 7 * Math.cos(a);
                const ny = cy - 7 * Math.sin(a);
                pdf.setDrawColor(INK);
                pdf.setLineWidth(1);
                pdf.line(px, py, nx, ny);
                px = nx;
                py = ny;
            }
            dot(cx, cy - 2.5, 1.3);
        } else {
            useText(8.5, 'bolditalic');
            pdf.text(MEASURE_MARKS[mark], x, b);
        }
    };

    const drawMarks = (marks: MeasureMark[], mx: number, mw: number, baseline: number) => {
        const place = (list: MeasureMark[], start: (total: number) => number) => {
            const total = list.reduce((n, mk) => n + markWidth(mk), 0) + Math.max(0, list.length - 1) * 4;
            let x = start(total);
            for (const mk of list) {
                drawMark(mk, x, baseline);
                x += markWidth(mk) + 4;
            }
        };
        const inset = 8;
        place(marks.filter((mk) => LEFT_MARKS.includes(mk)), () => mx + inset);
        place(marks.filter((mk) => CENTER_MARKS.includes(mk)), (t) => mx + (mw - t) / 2);
        place(
            marks.filter((mk) => !LEFT_MARKS.includes(mk) && !CENTER_MARKS.includes(mk)),
            (t) => mx + mw - inset - t
        );
    };

    const drawSimile = (cx: number, cy: number) => {
        pdf.setDrawColor(INK);
        pdf.setLineWidth(2);
        pdf.line(cx - 8, cy + 8, cx + 8, cy - 8);
        dot(cx - 6, cy - 5, 1.8);
        dot(cx + 6, cy + 5, 1.8);
    };

    const scoreRows = (s: PdfChartSection, time: { num: string; den: string } | null): Row[] => {
        const maxPer = Math.max(2, Math.floor((colW - GUTTER) / 48));
        const per = Math.min(Math.max(2, s.perRow || 4), maxPer);
        const mw = (colW - GUTTER - 4) / per;
        const staffH = Math.max(34, o.chordSize * 2.4);
        const inset = 8;

        return chunk(s.measures, per).map((group, ri): Row => {
            const voltaH = group.some((m) => m.ending) ? 14 : 0;
            const marksH = group.some((m) => m.marks?.length) ? 17 : 0;
            const noteH = group.some((m) => m.note) ? 12 : 0;

            return {
                h: voltaH + marksH + staffH + noteH + 14,
                draw: (x, y) => {
                    const x0 = x + GUTTER;
                    const top = y + voltaH + marksH;
                    const bottom = top + staffH;
                    const mid = top + staffH / 2;

                    if (time && ri === 0) {
                        useText(15, 'bold');
                        pdf.text(time.num, x + GUTTER / 2, mid - 2, { align: 'center' });
                        pdf.text(time.den, x + GUTTER / 2, mid + 12.5, { align: 'center' });
                    }

                    // Barras entre compases (y a los extremos de la fila)
                    for (let i = 0; i <= group.length; i++) {
                        bar(x0 + i * mw, barBetween(group[i - 1], group[i]), top, bottom);
                    }

                    group.forEach((m, i) => {
                        const mx = x0 + i * mw;

                        if (m.simile) drawSimile(mx + mw / 2, mid);
                        else {
                            const cw = (mw - inset * 2) / m.beats.length;
                            m.beats.forEach((b, k) => centered(b.trim(), mx + inset + k * cw, cw, mid, size, '/'));
                        }

                        if (m.marks?.length) drawMarks(m.marks, mx, mw, top - 4);

                        if (m.note) {
                            useText(8, 'italic', MUTED);
                            pdf.text(sh.fit(m.note, mw - 8), mx + mw / 2, bottom + 9, { align: 'center' });
                        }
                    });

                    // Casillas de repetición: una llave por cada grupo seguido con el mismo número
                    for (let i = 0; i < group.length;) {
                        const e = group[i].ending;
                        if (!e) { i++; continue; }
                        let j = i;
                        while (j + 1 < group.length && group[j + 1].ending === e) j++;
                        const xa = x0 + i * mw + 1;
                        const xb = x0 + (j + 1) * mw - 1;
                        const vy = y + 2;
                        hline(xa, xb, vy, 0.9);
                        vline(xa, vy, vy + 11, 0.9);
                        useText(8.5, 'bold');
                        pdf.text(`${e}.`, xa + 4, vy + 10);
                        i = j + 1;
                    }
                },
            };
        });
    };

    /* ---------- Secciones ---------- */

    const advanced = chart.style === 'advanced';
    let timeShown = false;

    for (const s of chart.sections) {
        const w = advanced ? colW : innerW; // el avanzado no lleva tarjeta
        const rows: Row[] = [sh.sectionRow(s, w)];
        if (s.measures.length === 0) {
            rows.push(...sh.commentRows('Sin compases.', w));
        } else if (advanced) {
            rows.push(...scoreRows(s, timeShown ? null : chart.time));
            timeShown = true;
        } else {
            rows.push(...gridRows(s));
        }
        sh.place(rows, !advanced);
    }

    return sh.finish();
}