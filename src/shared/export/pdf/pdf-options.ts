import { PDF_FONTS } from './pdf-fonts';

export const MARGINS = { narrow: 28, normal: 42, wide: 60 } as const;
export type MarginKey = keyof typeof MARGINS;

export const SPACING = {
    compact: { line: 1.15, section: 12 },
    normal: { line: 1.3, section: 18 },
    relaxed: { line: 1.5, section: 26 },
} as const;
export type SpacingKey = keyof typeof SPACING;

export type PaperSize = 'a4' | 'letter';

export const CHORD_COLORS = [
    { value: '#1d4ed8', label: 'Azul' },
    { value: '#c2410c', label: 'Naranja' },
    { value: '#b91c1c', label: 'Rojo' },
    { value: '#15803d', label: 'Verde' },
    { value: '#7c3aed', label: 'Violeta' },
    { value: '#111111', label: 'Negro' },
] as const;

export interface PdfOptions {
    paper: PaperSize;
    margin: MarginKey;
    columns: 'auto' | 1 | 2;
    spacing: SpacingKey;
    /** true = no parte una sección entre columnas o páginas si cabe entera. */
    keepTogether: boolean;
    pageNumbers: boolean;

    textFont: string;
    chordFont: string;
    chordBold: boolean;
    titleSize: number;
    textSize: number;
    chordSize: number;
    titleUppercase: boolean;
    sectionUppercase: boolean;

    /** false = blanco y negro (impresión). */
    color: boolean;
    chordColor: string;
}

export const PDF_DEFAULTS: PdfOptions = {
    paper: 'a4',
    margin: 'narrow',
    columns: 'auto',
    spacing: 'compact',
    keepTogether: true,
    pageNumbers: true,
    textFont: 'montserrat',
    chordFont: 'montserrat',
    chordBold: true,
    titleSize: 20,
    textSize: 14,
    chordSize: 14,
    color: false,
    chordColor: CHORD_COLORS[0].value,
    titleUppercase: true,
    sectionUppercase: true,
};

/** Valida lo guardado: valores desconocidos o fuera de rango vuelven al predeterminado. */
export function sanitizePdfOptions(raw: unknown): PdfOptions {
    const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const d = PDF_DEFAULTS;
    const pick = <T extends string | number>(v: unknown, allowed: readonly T[], fallback: T): T =>
        allowed.includes(v as T) ? (v as T) : fallback;
    const num = (v: unknown, min: number, max: number, fallback: number) =>
        typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : fallback;
    const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
    const fonts = PDF_FONTS.map((f) => f.id);

    return {
        paper: pick(r.paper, ['a4', 'letter'] as const, d.paper),
        margin: pick(r.margin, Object.keys(MARGINS) as MarginKey[], d.margin),
        columns: pick(r.columns, ['auto', 1, 2] as const, d.columns),
        spacing: pick(r.spacing, Object.keys(SPACING) as SpacingKey[], d.spacing),
        keepTogether: bool(r.keepTogether, d.keepTogether),
        pageNumbers: bool(r.pageNumbers, d.pageNumbers),
        textFont: pick(r.textFont, fonts, d.textFont),
        chordFont: pick(r.chordFont, fonts, d.chordFont),
        chordBold: bool(r.chordBold, d.chordBold),
        titleSize: num(r.titleSize, 16, 40, d.titleSize),
        textSize: num(r.textSize, 8, 18, d.textSize),
        chordSize: num(r.chordSize, 8, 18, d.chordSize),
        color: bool(r.color, d.color),
        chordColor: pick(r.chordColor, CHORD_COLORS.map((c) => c.value), d.chordColor),
        titleUppercase: bool(r.titleUppercase, d.titleUppercase),
        sectionUppercase: bool(r.sectionUppercase, d.sectionUppercase),
    };
}