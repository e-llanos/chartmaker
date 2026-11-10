/**
 * Transposición con ortografía correcta.
 *
 * Regla: al transponer con una tonalidad conocida, cada nota se escribe como en la escala de la
 * tonalidad destino (en Bb: Eb, no D#); las notas ajenas a la escala usan sostenidos o bemoles
 * según su armadura. La tonalidad destino siempre es una tonalidad práctica (G + 3 = Bb, no A#).
 * Solo cambian la raíz y el bajo: el sufijo del acorde se conserva tal como se escribió.
 */
import { formatChord, parseChord, type Chord } from './chord';
import { spell } from './interval';
import {
    MAJOR_FORMULA,
    NATURAL_MINOR_FORMULA,
    THEORY_ROOTS,
    formatKey,
    isPracticalKey,
    keyAccidentals,
    parseKey,
    type Key,
} from './key';
import { mod, parseNote, pitchClassOf } from './pitch';

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
/** Tonalidad sin alteraciones: Eb, Ab y Bb (préstamos del modo menor) pero F# y C#. */
const NEUTRAL = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

/** Notas de la tonalidad (la menor incluye la sensible) por altura. */
function diatonicNames(key: Key): Map<number, string> {
    const tonic = parseNote(key.tonic);
    const names = new Map<number, string>();
    if (!tonic) return names;
    const tokens = key.mode === 'major' ? [...MAJOR_FORMULA] : [...NATURAL_MINOR_FORMULA, '7'];
    for (const token of tokens) {
        const note = spell(tonic, token);
        if (!names.has(note.pc)) names.set(note.pc, note.name);
    }
    return names;
}

/** Cómo se escribe una altura: según la escala de la tonalidad, o por su armadura si es ajena. */
export function spellPitch(pc: number, key: Key | null, preferFlats = false): string {
    const p = mod(pc, 12);
    if (key) {
        const diatonic = diatonicNames(key).get(p);
        if (diatonic) return diatonic;
        const accidentals = keyAccidentals(key) ?? 0;
        return (accidentals > 0 ? SHARPS : accidentals < 0 ? FLATS : NEUTRAL)[p] ?? '';
    }
    return (preferFlats ? FLATS : NEUTRAL)[p] ?? '';
}

const usesFlats = (...names: Array<string | undefined>): boolean => {
    const text = names.filter(Boolean).join('');
    return text.includes('b') && !text.includes('#');
};

/** Transpone un acorde `semitones`; `key` es la tonalidad destino (para escribir bien las notas). */
export function transposeChord(chord: Chord, semitones: number, key: Key | null = null): Chord {
    const preferFlats = usesFlats(chord.root, chord.bass);
    const move = (name: string): string => {
        const pc = pitchClassOf(name);
        return pc === null ? name : spellPitch(pc + semitones, key, preferFlats);
    };
    return { ...chord, root: move(chord.root), ...(chord.bass ? { bass: move(chord.bass) } : {}) };
}

/**
 * Transpone una tonalidad y la escribe como tonalidad práctica: "G" + 3 -> "Bb"; "Em" + 1 -> "Fm".
 * Entre dos escrituras con las mismas alteraciones (F# / Gb) se queda con la del mismo tipo que la original.
 */
export function transposeKey(keyText: string, semitones: number): string | null {
    const key = parseKey(keyText);
    const pc = key ? pitchClassOf(key.tonic) : null;
    if (!key || pc === null) return null;
    const target = mod(pc + semitones, 12);
    const original = keyAccidentals(key) ?? 0;
    const candidates = THEORY_ROOTS.filter((r) => pitchClassOf(r) === target)
        .map((tonic): Key => ({ tonic, mode: key.mode }))
        .filter(isPracticalKey);
    const rank = (k: Key) => {
        const n = keyAccidentals(k) ?? 0;
        return [Math.abs(n), original < 0 ? (n < 0 ? 0 : 1) : n > 0 ? 0 : 1];
    };
    candidates.sort((a, b) => {
        const [sa = 0, ta = 0] = rank(a);
        const [sb = 0, tb = 0] = rank(b);
        return sa - sb || ta - tb;
    });
    const best = candidates[0];
    return best ? formatKey(best) : null;
}

/** Transpone el texto de un acorde (americano). Null si no es un acorde. */
export function transposeChordText(text: string, semitones: number, key: Key | null = null): string | null {
    const chord = parseChord(text);
    return chord ? formatChord(transposeChord(chord, semitones, key)) : null;
}
