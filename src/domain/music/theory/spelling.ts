/**
 * Escrituras teóricas: cuando una escala o un acorde necesita dobles o triples alteraciones
 * (D# mayor lleva F## y C##), suele existir una raíz enarmónica que se escribe más simple (Eb).
 * Sirve para avisar con fines didácticos; escribir la forma teórica no es un error.
 * Solo se sugiere una raíz más habitual que la actual.
 */
import { accidentalsOf, enharmonicRoots, keyAccidentals } from '@/domain/music/core';
import { buildChord, type BuiltChord } from './chords';
import { buildScale, type BuiltScale } from './scales';

/** Alteraciones de más en una nota: F## cuenta 1 y F### cuenta 2. */
const extra = (name: string): number => Math.max(0, Math.abs(accidentalsOf(name)) - 1);

/** Notas con doble o triple alteración. */
export const overAltered = (names: string[]): string[] => names.filter((n) => extra(n) > 0);

export interface SimplerSpelling {
    /** Raíz enarmónica con menos alteraciones de más. */
    root: string;
    notes: string[];
}

/**
 * Qué tan habitual es una raíz: las alteraciones de su armadura más simple, como mayor o como menor
 * (Eb = 3, D# = 6, A# = 7). Menor es más habitual. Evita recomendar una raíz más rara (Bb -> A#).
 */
const rank = (root: string): number =>
    Math.min(
        ...(['major', 'minor'] as const).map((mode) => Math.abs(keyAccidentals({ tonic: root, mode }) ?? Number.POSITIVE_INFINITY)),
    );

const cost = (names: string[]): number => names.reduce((sum, n) => sum + extra(n), 0);
const marks = (names: string[]): number => names.reduce((sum, n) => sum + Math.abs(accidentalsOf(n)), 0);

function simplest(root: string, notesAt: (root: string) => string[] | null): SimplerSpelling | null {
    const current = notesAt(root);
    if (!current || cost(current) === 0) return null;
    const best = enharmonicRoots(root)
        .filter((r) => rank(r) < rank(root))
        .flatMap((r) => {
            const notes = notesAt(r);
            return notes ? [{ root: r, notes }] : [];
        })
        .sort((a, b) => cost(a.notes) - cost(b.notes) || marks(a.notes) - marks(b.notes))[0];
    return best && cost(best.notes) < cost(current) ? best : null;
}

/** Escritura más simple de una escala, o null si ya es la más simple. */
export const simplerScale = (scale: BuiltScale): SimplerSpelling | null =>
    simplest(scale.root, (r) => buildScale(r, scale.def.id)?.notes.map((n) => n.name) ?? null);

/** Escritura más simple de un acorde, o null si ya es la más simple. */
export const simplerChord = (chord: BuiltChord): SimplerSpelling | null =>
    simplest(chord.notes[0]?.name ?? '', (r) => buildChord(r, chord.quality.id)?.notes.map((n) => n.name) ?? null);
