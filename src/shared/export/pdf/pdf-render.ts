import type { jsPDF } from 'jspdf';
import { createSheet, type Row } from './pdf-sheet';
import type { PdfOptions } from './pdf-options';
import type { PdfMode, PdfSong, PdfToken } from './pdf-song';

interface Atom {
    chord: string | null;
    text: string;
    /** true = va pegado a la palabra anterior (acorde a mitad de palabra). */
    glue: boolean;
    /** Avance horizontal: lo mayor entre el texto y el acorde (+ separación). */
    adv: number;
    /** Ancho visible sin el espacio final. */
    fit: number;
}

export async function renderSongPdf(song: PdfSong, o: PdfOptions): Promise<jsPDF> {
    const sh = await createSheet(song, o);
    const { pdf, innerW: colW, lineH, useText, chordWidth, drawChord } = sh;

    /** Divide cada trozo en palabras; el acorde queda en la primera. */
    const toAtoms = (tokens: PdfToken[], mode: PdfMode): Atom[] => {
        const gap = mode === 'chords' ? o.chordSize * 0.9 : o.chordSize * 0.4;
        const raw: Array<{ chord: string | null; text: string; glue: boolean }> = [];

        if (mode === 'chords') {
            for (const t of tokens) if (t.chord) raw.push({ chord: t.chord, text: '', glue: false });
        } else {
            let prevEndsSpace = true;
            for (const t of tokens) {
                const parts = t.text.match(/\S+\s*|\s+/g) ?? [''];
                parts.forEach((p, i) => {
                    raw.push({
                        chord: mode === 'full' && i === 0 ? t.chord : null,
                        text: p,
                        glue: i === 0 && !prevEndsSpace,
                    });
                    if (p) prevEndsSpace = /\s$/.test(p);
                });
            }
        }

        return raw.map((a) => {
            const cw = a.chord ? chordWidth(a.chord) : 0;
            useText(o.textSize); // chordWidth cambió la fuente
            const textW = a.text ? pdf.getTextWidth(a.text) : 0;
            const trimW = a.text.trim() ? pdf.getTextWidth(a.text.trimEnd()) : 0;
            return { ...a, adv: Math.max(textW, a.chord ? cw + gap : 0), fit: Math.max(trimW, cw) };
        });
    };

    /** Reparte los átomos en filas sin partir palabras. */
    const wrap = (atoms: Atom[]): Atom[][] => {
        const words: Atom[][] = [];
        for (const a of atoms) {
            if (a.glue && words.length) words[words.length - 1].push(a);
            else words.push([a]);
        }
        const lines: Atom[][] = [[]];
        let x = 0;
        for (const w of words) {
            const adv = w.reduce((s, a) => s + a.adv, 0);
            const last = w[w.length - 1];
            const fit = adv - last.adv + last.fit;
            if (x > 0 && x + fit > colW) {
                lines.push([]);
                x = 0;
            }
            lines[lines.length - 1].push(...w);
            x += adv;
        }
        return lines.filter((l) => l.length);
    };

    const layoutLine = (tokens: PdfToken[], mode: PdfMode): Row[] => {
        const atoms = toAtoms(tokens, mode);
        if (!atoms.some((a) => a.chord || (mode !== 'chords' && a.text.trim()))) return [];

        return wrap(atoms).map((line): Row => {
            const hasChord = line.some((a) => a.chord);
            const hasText = line.some((a) => a.text.trim());
            const chordBlock = hasChord ? o.chordSize * 1.25 : 0;
            const h = hasText ? chordBlock + o.textSize * lineH : o.chordSize * lineH;

            return {
                h,
                draw: (x0, y) => {
                    let x = x0;
                    for (const a of line) {
                        if (a.chord) drawChord(a.chord, x, y + o.chordSize * 0.9);
                        if (a.text.trim()) {
                            useText(o.textSize);
                            pdf.text(a.text, x, y + chordBlock + o.textSize * 0.85);
                        }
                        x += a.adv;
                    }
                },
            };
        });
    };

    for (const s of song.sections) {
        const rows: Row[] = [sh.sectionRow(s)];
        for (const l of s.lines) {
            rows.push(...('comment' in l ? sh.commentRows(l.comment) : layoutLine(l.tokens, song.mode)));
        }
        sh.place(rows);
    }

    return sh.finish();
}