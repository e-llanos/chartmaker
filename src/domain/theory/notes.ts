/**
 * Notas, intervalos y ortografía para la sección de teoría.
 * El modelo vive en `domain/music/core`; aquí solo se reexporta y se añade lo de presentación
 * (nombres en notación latina).
 */
import { LETTERS } from '@/domain/music/core/pitch';

export { LETTERS, mod, noteName, parseNote, type Note } from '@/domain/music/core/pitch';
export { degreeSemitones, intervalName, parseDegree, spell, type SpelledNote } from '@/domain/music/core/interval';
export { THEORY_ROOTS } from '@/domain/music/core/key';

const LATIN = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

export type NameStyle = 'symbol' | 'latin';

/** "F#" -> "Fa#" en notación latina. */
export function formatNote(name: string, style: NameStyle): string {
    if (style === 'symbol') return name;
    const letter = LETTERS.findIndex((l) => l === name[0]);
    return letter < 0 ? name : `${LATIN[letter] ?? ''}${name.slice(1)}`;
}

/** "Bbm7b5" -> "Sibm7b5" en notación latina (solo cambia la nota raíz). */
export function formatChordSymbol(symbol: string, style: NameStyle): string {
    if (style === 'symbol') return symbol;
    const m = symbol.match(/^([A-G](?:#{1,2}|b{1,2})?)(.*)$/);
    return m ? formatNote(m[1] ?? '', style) + (m[2] ?? '') : symbol;
}
