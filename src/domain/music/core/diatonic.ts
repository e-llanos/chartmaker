/**
 * Acordes que salen de apilar terceras sobre cada nota de una escala de 7 notas.
 * Lo usan la sección de teoría y la paleta del editor: una sola implementación.
 */
import { qualityFromStack, type ChordQuality } from './chord-quality';
import { mod } from './pitch';

export interface StackedChord {
    /** Grado de la escala (1–7). */
    degree: number;
    root: string;
    /** Semitonos de la tercera sobre la raíz (3 = menor, 4 = mayor). */
    third: number;
    triad: { quality: ChordQuality; notes: string[] } | null;
    seventh: { quality: ChordQuality; notes: string[] } | null;
}

/** Null si la escala no tiene 7 notas. */
export function stackThirds(notes: ReadonlyArray<{ name: string; semis: number }>): StackedChord[] | null {
    if (notes.length !== 7) return null;
    const at = (i: number) => notes[i % 7];
    const rel = (from: number, to: number) => mod((at(to)?.semis ?? 0) - (at(from)?.semis ?? 0), 12);
    return notes.map((note, i) => {
        const third = rel(i, i + 2);
        const fifth = rel(i, i + 4);
        const seventh = rel(i, i + 6);
        const names = (steps: number[]) => steps.map((s) => at(i + s)?.name ?? '');
        const triad = qualityFromStack(third, fifth);
        const sev = qualityFromStack(third, fifth, seventh);
        return {
            degree: i + 1,
            root: note.name,
            third,
            triad: triad ? { quality: triad, notes: names([0, 2, 4]) } : null,
            seventh: sev ? { quality: sev, notes: names([0, 2, 4, 6]) } : null,
        };
    });
}
