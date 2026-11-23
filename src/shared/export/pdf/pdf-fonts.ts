import type { jsPDF } from 'jspdf';

export type FontStyle = 'normal' | 'bold' | 'italic' | 'bolditalic';

export interface PdfFont {
    id: string;
    label: string;
    /** Nombre con el que se registra en jsPDF. */
    family: string;
    /** Carpeta dentro de /public/fonts donde están los archivos de la familia. */
    dir?: string;
    /** Archivos .ttf (nombre solo, dentro de `dir`). Sin archivos = fuente integrada de jsPDF. */
    files?: Partial<Record<FontStyle, string>>;
}

export const PDF_FONTS: PdfFont[] = [
    {
        id: 'montserrat', label: 'Montserrat', family: 'Montserrat', dir: 'montserrat',
        files: { normal: 'Montserrat-Regular.ttf', bold: 'Montserrat-Bold.ttf', italic: 'Montserrat-Italic.ttf', bolditalic: 'Montserrat-BoldItalic.ttf' },
    },
    {
        id: 'lora', label: 'Lora (serif)', family: 'Lora', dir: 'lora',
        files: { normal: 'Lora-Regular.ttf', bold: 'Lora-Bold.ttf', italic: 'Lora-Italic.ttf', bolditalic: 'Lora-BoldItalic.ttf' },
    },
    {
        id: 'roboto', label: 'Roboto', family: 'Roboto', dir: 'roboto',
        files: { normal: 'Roboto-Regular.ttf', bold: 'Roboto-Bold.ttf', italic: 'Roboto-Italic.ttf', bolditalic: 'Roboto-BoldItalic.ttf' },
    },
    {
        id: 'robotomono', label: 'Roboto Mono', family: 'RobotoMono', dir: 'roboto-mono',
        files: { normal: 'RobotoMono-Regular.ttf', bold: 'RobotoMono-Bold.ttf', italic: 'RobotoMono-Italic.ttf', bolditalic: 'RobotoMono-BoldItalic.ttf' },
    },
];

export function getPdfFont(id: string): PdfFont {
    return PDF_FONTS.find((f) => f.id === id) ?? PDF_FONTS[0];
}

const FALLBACK: Record<FontStyle, FontStyle[]> = {
    normal: ['normal'],
    bold: ['bold', 'normal'],
    italic: ['italic', 'normal'],
    bolditalic: ['bolditalic', 'bold', 'italic', 'normal'],
};

/** Estilo disponible más cercano al pedido (una fuente puede no traer cursiva). */
export function fontStyleFor(font: PdfFont, wanted: FontStyle): FontStyle {
    if (!font.files) return wanted;
    return FALLBACK[wanted].find((s) => font.files?.[s]) ?? 'normal';
}

const cache = new Map<string, Promise<string>>();

function toBase64(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
        bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
}

function loadFont(url: string): Promise<string> {
    let p = cache.get(url);
    if (!p) {
        p = fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error(`Falta el archivo de tipografía ${url}`);
                return res.arrayBuffer();
            })
            .then(toBase64)
            .catch((err) => {
                cache.delete(url); // permite reintentar
                throw err;
            });
        cache.set(url, p);
    }
    return p;
}

/** Registra en el documento las tipografías con archivo (las integradas no lo necesitan). */
export async function registerFonts(pdf: jsPDF, ids: string[]): Promise<void> {
    for (const id of new Set(ids)) {
        const font = getPdfFont(id);
        if (!font.files) continue;
        for (const [style, file] of Object.entries(font.files)) {
            const url = `/fonts/${font.dir ? `${font.dir}/` : ''}${file}`;
            // En el sistema de archivos virtual de jsPDF va solo el nombre, sin carpetas.
            pdf.addFileToVFS(file, await loadFont(url));
            pdf.addFont(file, font.family, style);
        }
    }
}