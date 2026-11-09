import { diatonicChords, type HarmonicFunction } from './chords';
import { parseNote } from './notes';
import { buildScale } from './scales';

export interface ProgressionStep {
    degree: number;
    /** Usa la cuatríada (séptima) en lugar de la tríada. */
    seventh?: boolean;
    /** Toma el acorde de otra escala (por ejemplo, el V mayor de la menor armónica). */
    scale?: 'harmonic-minor';
}

export interface Progression {
    id: string;
    name: string;
    mode: 'major' | 'minor';
    steps: ProgressionStep[];
    note: string;
}

export interface CircleKey {
    major: string;
    /** Relativa menor con sufijo: "Am". */
    minor: string;
    /** Relativa menor sin sufijo: "A". */
    minorRoot: string;
    signature: string;
    /** Alteraciones de la armadura: positivo = sostenidos, negativo = bemoles. */
    accidentals: number;
    majorPc: number;
    minorPc: number;
}

const d = (degree: number, seventh = false): ProgressionStep => ({ degree, ...(seventh ? { seventh } : {}) });
const harmonic = (degree: number, seventh = false): ProgressionStep => ({ ...d(degree, seventh), scale: 'harmonic-minor' });

export const PROGRESSIONS: Progression[] = [
    {
        id: 'pop', name: 'Pop', mode: 'major', steps: [d(1), d(5), d(6), d(4)],
        note: 'La progresión más usada del pop actual.'
    },
    {
        id: 'vi-first', name: 'Pop empezando en el vi', mode: 'major', steps: [d(6), d(4), d(1), d(5)],
        note: 'Los mismos acordes que la anterior, pero empezando en el relativo menor: suena más emotiva.'
    },
    {
        id: 'fifties', name: 'Años 50', mode: 'major', steps: [d(1), d(6), d(4), d(5)],
        note: 'Típica del doo-wop y del rock and roll.'
    },
    {
        id: 'basic', name: 'Tres acordes', mode: 'major', steps: [d(1), d(4), d(5), d(1)],
        note: 'La base del blues, el rock y el góspel.'
    },
    {
        id: 'canon', name: 'Canon de Pachelbel', mode: 'major', steps: [d(1), d(5), d(6), d(3), d(4), d(1), d(4), d(5)],
        note: 'Ocho acordes que se repiten en cientos de canciones.'
    },
    {
        id: 'ii-v-i', name: 'ii–V–I (jazz)', mode: 'major', steps: [d(2, true), d(5, true), d(1, true)],
        note: 'La cadencia fundamental del jazz, con séptimas.'
    },
    {
        id: 'epic', name: 'Menor épica', mode: 'minor', steps: [d(1), d(6), d(3), d(7)],
        note: 'Sonido amplio y dramático, muy común en el pop y el rock actuales.'
    },
    {
        id: 'andalusian', name: 'Cadencia andaluza', mode: 'minor', steps: [d(1), d(7), d(6), harmonic(5)],
        note: 'Descenso típico del flamenco. El V mayor sale de la menor armónica.'
    },
    {
        id: 'minor-i-iv-v', name: 'i–iv–V', mode: 'minor', steps: [d(1), d(4), harmonic(5), d(1)],
        note: 'Cadencia menor clásica, con el dominante mayor.'
    },
    {
        id: 'minor-ii-v-i', name: 'iiø–V–i (jazz)', mode: 'minor', steps: [d(2, true), harmonic(5, true), d(1, true)],
        note: 'La versión menor de la cadencia del jazz.'
    },
];

export const CADENCES: Progression[] = [
    {
        id: 'perfect', name: 'Perfecta (auténtica)', mode: 'major', steps: [d(5), d(1)],
        note: 'Da sensación de final: la dominante resuelve a la tónica.'
    },
    {
        id: 'plagal', name: 'Plagal', mode: 'major', steps: [d(4), d(1)],
        note: 'El "amén" de los himnos: un final suave.'
    },
    {
        id: 'half', name: 'Semicadencia', mode: 'major', steps: [d(1), d(5)],
        note: 'Termina en el dominante: suena a pregunta o a pausa.'
    },
    {
        id: 'deceptive', name: 'Rota (deceptiva)', mode: 'major', steps: [d(5), d(6)],
        note: 'Se espera la tónica y llega el vi: sorpresa.'
    },
];

/** Convierte una progresión en acordes de la tonalidad elegida. */
export function resolveProgression(root: string, p: Progression): Array<{ symbol: string; roman: string }> {
    const base = p.mode === 'major' ? 'major' : 'natural-minor';
    return p.steps.flatMap((step) => {
        const scale = buildScale(root, step.scale ?? base);
        const chord = scale ? diatonicChords(scale)?.[step.degree - 1] : undefined;
        const info = step.seventh ? chord?.seventh : chord?.triad;
        return info ? [{ symbol: info.symbol, roman: info.roman }] : [];
    });
}

/** Las doce tonalidades mayores por quintas, con su armadura y su relativa menor. */
export function circleOfFifths(): CircleKey[] {
    const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
    return keys.flatMap((major) => {
        const scale = buildScale(major, 'major');
        if (!scale) return [];
        const sharps = scale.notes.filter((n) => n.name.includes('#')).length;
        const flats = scale.notes.filter((n) => n.name.includes('b')).length;
        const minorRoot = scale.notes[5]?.name ?? '';
        return [{
            major,
            minor: `${minorRoot}m`,
            minorRoot,
            signature: sharps ? `${sharps} ♯` : flats ? `${flats} ♭` : 'Sin alteraciones',
            accidentals: sharps - flats,
            majorPc: scale.notes[0]?.pc ?? 0,
            minorPc: scale.notes[5]?.pc ?? 0,
        }];
    });
}


const SHARP_ORDER = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'];
const FLAT_ORDER = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'];

/** Notas alteradas de una armadura: 2 -> [F#, C#]; -3 -> [Bb, Eb, Ab]. */
export function keySignature(accidentals: number): string[] {
    return accidentals >= 0 ? SHARP_ORDER.slice(0, accidentals) : FLAT_ORDER.slice(0, -accidentals);
}

export interface CircleRole {
    ring: 'outer' | 'inner';
    /** Posición en el círculo (0 = arriba, en sentido horario). */
    index: number;
    fn: HarmonicFunction;
    roman: string;
    symbol: string;
    tonic: boolean;
}

/** Qué acordes de la tonalidad ocupan una posición del círculo (los disminuidos no tienen sitio). */
export function circleRoles(root: string, minor: boolean): CircleRole[] {
    const keys = circleOfFifths();
    const scale = buildScale(root, minor ? 'natural-minor' : 'major');
    const chords = scale ? diatonicChords(scale) : null;
    if (!chords) return [];
    return chords.flatMap((c) => {
        const info = c.triad;
        const pc = parseNote(c.root)?.pc;
        if (!info || !c.fn || pc === undefined) return [];
        const isMajor = info.symbol === c.root;
        const isMinor = info.symbol === `${c.root}m`;
        if (!isMajor && !isMinor) return [];
        const index = keys.findIndex((k) => (isMajor ? k.majorPc : k.minorPc) === pc);
        if (index < 0) return [];
        return [{
            ring: isMajor ? 'outer' : 'inner',
            index,
            fn: c.fn,
            roman: info.roman,
            symbol: info.symbol,
            tonic: c.degree === 1,
        } as CircleRole];
    });
}