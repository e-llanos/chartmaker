/**
 * Acorde como dato: raíz + sufijo (tal como lo escribió el usuario) + bajo opcional.
 *
 * Regla: se acepta cualquier alias al escribir, se GUARDA lo tecleado y solo se normaliza
 * para analizar. Por eso `suffix` conserva el texto original ("Δ", "-7") y `quality` es el
 * id canónico que se usa para entender qué acorde es.
 */

const NOTE = '[A-G](?:#{1,3}|b{1,3})?';
/** "6/9" lleva barra pero no es un bajo: se reconoce antes de separar el bajo. */
const CHORD = new RegExp(`^(${NOTE})((?:6\\/9|[^/])*)(?:\\/(${NOTE}))?$`);

export interface Chord {
    /** Raíz: "D#", "Bb". */
    root: string;
    /** Lo que sigue a la raíz, tal cual se escribió. "" = mayor. */
    suffix: string;
    /** Bajo alterno: en "C/E" es "E". */
    bass?: string;
    /** Id canónico del tipo de acorde ("m7b5"), o null si no se reconoce. */
    quality: string | null;
}

/** Alias de escritura -> id canónico (los mismos ids que el catálogo de teoría). */
const ALIASES: ReadonlyMap<string, string> = new Map(
    Object.entries({
        maj: ['', 'M', 'maj', 'major'],
        min: ['m', 'min', 'mi', '-', 'minor'],
        dim: ['dim', '°', 'o'],
        aug: ['aug', '+'],
        sus2: ['sus2'],
        sus4: ['sus4', 'sus'],
        '7sus4': ['7sus4', '7sus'],
        '6': ['6'],
        m6: ['m6', 'min6', '-6'],
        '7': ['7', 'dom7'],
        maj7: ['maj7', 'Maj7', 'M7', 'ma7', 'Δ', 'Δ7'],
        m7: ['m7', 'min7', 'mi7', '-7'],
        mMaj7: ['m(maj7)', 'mMaj7', 'mmaj7', 'mM7', 'm(M7)', 'mΔ', 'm(Δ)', '-Δ', '-maj7'],
        m7b5: ['m7b5', 'm7(b5)', 'min7b5', '-7b5', 'ø', 'ø7'],
        dim7: ['dim7', '°7', 'o7'],
        add9: ['add9', 'add2'],
        '9': ['9'],
        maj9: ['maj9', 'Maj9', 'M9', 'ma9', 'Δ9'],
        m9: ['m9', 'min9', 'mi9', '-9'],
    }).flatMap(([id, names]) => names.map((name): [string, string] => [name, id])),
);

/** Id canónico del sufijo de un acorde ("Δ7" -> "maj7"), o null si no se reconoce. */
export const qualityOf = (suffix: string): string | null => ALIASES.get(suffix.trim()) ?? null;

/** "Dm7/G" -> { root: "D", suffix: "m7", bass: "G", quality: "m7" }. Null si no es un acorde ("N.C.", "%"). */
export function parseChord(text: string): Chord | null {
    const m = text.trim().match(CHORD);
    if (!m) return null;
    const suffix = m[2] ?? '';
    return { root: m[1] ?? '', suffix, ...(m[3] ? { bass: m[3] } : {}), quality: qualityOf(suffix) };
}

/** Vuelve al texto: es exactamente lo que se parseó. */
export const formatChord = (chord: Chord): string =>
    `${chord.root}${chord.suffix}${chord.bass ? `/${chord.bass}` : ''}`;
