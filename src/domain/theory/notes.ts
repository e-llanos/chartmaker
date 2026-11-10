/**
 * Reexportaciones temporales hacia `domain/music/core`. Se elimina este archivo cuando los
 * componentes importen directamente desde core.
 */
export { LETTERS, mod, noteName, parseNote, type Note } from '@/domain/music/core/pitch';
export { degreeSemitones, intervalName, parseDegree, spell, type SpelledNote } from '@/domain/music/core/interval';
export { THEORY_ROOTS } from '@/domain/music/core/key';
export { formatChordSymbol, formatNote, type NameStyle } from '@/domain/music/core/notation';
