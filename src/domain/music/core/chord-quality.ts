/**
 * Tipos de acorde: ÚNICA fuente de verdad.
 *
 * De esta tabla salen: el catálogo de la sección de teoría, los alias que reconoce el parser,
 * el sufijo de los números romanos y las tríadas y cuatríadas que aparecen al apilar terceras.
 * Para añadir un tipo de acorde basta una línea aquí.
 */
import { degreeSemitones, parseDegree } from './interval';

export type ChordGroup = 'triad' | 'sus' | 'sixth' | 'seventh' | 'ninth';

export interface ChordQuality {
    id: string;
    /** Sufijo canónico del cifrado: "", "m", "maj7"… */
    symbol: string;
    name: string;
    group: ChordGroup;
    /** Grados sobre la tónica. */
    formula: string[];
    /** Otras formas de escribirlo, además de `symbol`. */
    aliases: string[];
    /** Lo que añade a un número romano: "°" en vii°, "ø7" en iiø7, "" en V. */
    roman: string;
}

export const CHORD_QUALITIES: ChordQuality[] = [
    { id: 'maj', symbol: '', name: 'Mayor', group: 'triad', formula: ['1', '3', '5'], aliases: ['M', 'maj', 'major'], roman: '' },
    { id: 'min', symbol: 'm', name: 'Menor', group: 'triad', formula: ['1', 'b3', '5'], aliases: ['min', 'mi', '-', 'minor'], roman: '' },
    { id: 'dim', symbol: 'dim', name: 'Disminuido', group: 'triad', formula: ['1', 'b3', 'b5'], aliases: ['°', 'o'], roman: '°' },
    { id: 'aug', symbol: 'aug', name: 'Aumentado', group: 'triad', formula: ['1', '3', '#5'], aliases: ['+'], roman: '+' },
    { id: 'sus2', symbol: 'sus2', name: 'Suspendido 2', group: 'sus', formula: ['1', '2', '5'], aliases: [], roman: 'sus2' },
    { id: 'sus4', symbol: 'sus4', name: 'Suspendido 4', group: 'sus', formula: ['1', '4', '5'], aliases: ['sus'], roman: 'sus4' },
    { id: '7sus4', symbol: '7sus4', name: 'Séptima suspendida', group: 'sus', formula: ['1', '4', '5', 'b7'], aliases: ['7sus'], roman: '7sus4' },
    { id: '6', symbol: '6', name: 'Sexta', group: 'sixth', formula: ['1', '3', '5', '6'], aliases: [], roman: '6' },
    { id: 'm6', symbol: 'm6', name: 'Menor con sexta', group: 'sixth', formula: ['1', 'b3', '5', '6'], aliases: ['min6', '-6'], roman: '6' },
    { id: '7', symbol: '7', name: 'Dominante (séptima)', group: 'seventh', formula: ['1', '3', '5', 'b7'], aliases: ['dom7'], roman: '7' },
    { id: 'maj7', symbol: 'maj7', name: 'Mayor con séptima mayor', group: 'seventh', formula: ['1', '3', '5', '7'], aliases: ['Maj7', 'M7', 'ma7', 'Δ', 'Δ7'], roman: 'maj7' },
    { id: 'm7', symbol: 'm7', name: 'Menor con séptima', group: 'seventh', formula: ['1', 'b3', '5', 'b7'], aliases: ['min7', 'mi7', '-7'], roman: '7' },
    { id: 'mMaj7', symbol: 'm(maj7)', name: 'Menor con séptima mayor', group: 'seventh', formula: ['1', 'b3', '5', '7'], aliases: ['mMaj7', 'mmaj7', 'mM7', 'm(M7)', 'mΔ', 'm(Δ)', '-Δ', '-maj7'], roman: '(maj7)' },
    { id: 'm7b5', symbol: 'm7b5', name: 'Semidisminuido', group: 'seventh', formula: ['1', 'b3', 'b5', 'b7'], aliases: ['m7(b5)', 'min7b5', '-7b5', 'ø', 'ø7'], roman: 'ø7' },
    { id: 'dim7', symbol: 'dim7', name: 'Disminuido con séptima', group: 'seventh', formula: ['1', 'b3', 'b5', 'bb7'], aliases: ['°7', 'o7'], roman: '°7' },
    { id: '7#5', symbol: '7#5', name: 'Dominante con quinta aumentada', group: 'seventh', formula: ['1', '3', '#5', 'b7'], aliases: ['7+', '+7', 'aug7', '7aug', '7(#5)'], roman: '+7' },
    { id: 'maj7#5', symbol: 'maj7#5', name: 'Mayor con séptima mayor y quinta aumentada', group: 'seventh', formula: ['1', '3', '#5', '7'], aliases: ['maj7+', '+maj7', 'M7#5', 'maj7(#5)', 'Δ#5'], roman: '+maj7' },
    { id: '7b5', symbol: '7b5', name: 'Dominante con quinta disminuida', group: 'seventh', formula: ['1', '3', 'b5', 'b7'], aliases: ['7(b5)'], roman: '7b5' },
    { id: 'add9', symbol: 'add9', name: 'Mayor con novena añadida', group: 'ninth', formula: ['1', '3', '5', '9'], aliases: ['add2'], roman: 'add9' },
    { id: '9', symbol: '9', name: 'Dominante con novena', group: 'ninth', formula: ['1', '3', '5', 'b7', '9'], aliases: [], roman: '9' },
    { id: 'maj9', symbol: 'maj9', name: 'Mayor con séptima y novena', group: 'ninth', formula: ['1', '3', '5', '7', '9'], aliases: ['Maj9', 'M9', 'ma9', 'Δ9'], roman: 'maj9' },
    { id: 'm9', symbol: 'm9', name: 'Menor con novena', group: 'ninth', formula: ['1', 'b3', '5', 'b7', '9'], aliases: ['min9', 'mi9', '-9'], roman: '9' },
];

const BY_ID: ReadonlyMap<string, ChordQuality> = new Map(CHORD_QUALITIES.map((q) => [q.id, q]));

export const findQuality = (id: string): ChordQuality | null => BY_ID.get(id) ?? null;

/** Cada forma de escribir un tipo de acorde apunta a él; si dos coinciden, gana la primera. */
const BY_SUFFIX = new Map<string, ChordQuality>();
for (const q of CHORD_QUALITIES) {
    for (const text of [q.symbol, ...q.aliases]) if (!BY_SUFFIX.has(text)) BY_SUFFIX.set(text, q);
}

/** Tipo de acorde de un sufijo escrito de cualquier forma ("Δ7" -> maj7), o null si no se reconoce. */
export const qualityBySuffix = (suffix: string): ChordQuality | null => BY_SUFFIX.get(suffix.trim()) ?? null;

/** Un acorde "apilado por terceras" tiene los grados 1-3-5 (tríada) o 1-3-5-7 (cuatríada). */
const isStackedThirds = (formula: string[]): boolean => {
    const degrees = formula.map((t) => parseDegree(t)?.degree).join();
    return degrees === '1,3,5' || degrees === '1,3,5,7';
};

const STACKED: ReadonlyMap<string, ChordQuality> = new Map(
    CHORD_QUALITIES.filter((q) => isStackedThirds(q.formula)).map((q) => [
        q.formula.slice(1).map(degreeSemitones).join('-'),
        q,
    ]),
);

/**
 * Qué acorde sale de apilar terceras con esos intervalos en semitonos sobre la raíz.
 * (4, 7) -> mayor; (3, 6, 10) -> m7b5. Null si esa combinación no es un acorde del catálogo.
 */
export function qualityFromStack(third: number, fifth: number, seventh?: number): ChordQuality | null {
    const shape = seventh === undefined ? `${third}-${fifth}` : `${third}-${fifth}-${seventh}`;
    return STACKED.get(shape) ?? null;
}

/** Cómo se escribe en números romanos: minúscula si lleva 3.ª menor, y su sufijo. */
export function romanStyle(quality: ChordQuality): { lower: boolean; suffix: string } {
    return { lower: /^b{1,2}3$/.test(quality.formula[1] ?? ''), suffix: quality.roman };
}
