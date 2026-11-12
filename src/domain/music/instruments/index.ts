import { mod, type SpelledNote } from '@/domain/music/core';

export type Instrument = 'piano' | 'guitar';

export interface Tuning {
    id: string;
    label: string;
    /** Nota MIDI de cada cuerda, de la más grave a la más aguda. */
    strings: number[];
    /** Nombra las notas con bemoles (para afinaciones como medio tono abajo). */
    flats?: boolean;
}

export const TUNINGS: Tuning[] = [
    { id: 'standard', label: 'Estándar (E A D G B E)', strings: [40, 45, 50, 55, 59, 64] },
    { id: 'drop-d', label: 'Drop D (D A D G B E)', strings: [38, 45, 50, 55, 59, 64] },
    { id: 'dadgad', label: 'DADGAD (D A D G A D)', strings: [38, 45, 50, 55, 57, 62] },
    { id: 'half-down', label: 'Medio tono abajo (Eb Ab Db Gb Bb Eb)', strings: [39, 44, 49, 54, 58, 63], flats: true },
    { id: 'open-g', label: 'Open G (D G D G B D)', strings: [38, 43, 50, 55, 59, 62] },
];

export const getTuning = (id: string): Tuning => TUNINGS.find((t) => t.id === id) ?? TUNINGS[0]!;

/** Octava científica de una nota MIDI: 60 -> 4 (C4 = do central). */
export const midiOctave = (midi: number): number => Math.floor(midi / 12) - 1;

/** ¿Conviene nombrar las notas que no pertenecen a la escala con bemoles? */
export function preferFlatsFor(notes: SpelledNote[] | null, tuning?: Tuning): boolean {
    const hasFlat = notes?.some((n) => n.name.includes('b')) ?? false;
    const hasSharp = notes?.some((n) => n.name.includes('#')) ?? false;
    if (hasFlat !== hasSharp) return hasFlat;
    return tuning?.flats ?? false;
}

export interface FretCell {
    /** 0 = la cuerda más aguda (arriba en el dibujo). */
    row: number;
    fret: number;
    midi: number;
    pc: number;
    octave: number;
}

/** Mástil: una fila por cuerda (de la más aguda a la más grave) y una columna por traste, del 0 al `frets`. */
export function buildFretboard(tuning: Tuning, frets: number): FretCell[][] {
    return [...tuning.strings].reverse().map((open, row) =>
        Array.from({ length: frets + 1 }, (_, fret) => {
            const midi = open + fret;
            return { row, fret, midi, pc: mod(midi, 12), octave: midiOctave(midi) };
        }),
    );
}

/** Trastes con marca en el mástil (puntos). El 12 y el 24 llevan dos. */
export const FRET_MARKERS: number[] = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
export const DOUBLE_MARKERS: number[] = [12, 24];