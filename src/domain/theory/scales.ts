import { degreeSemitones, mod, noteName, parseNote, spell, type SpelledNote } from './notes';

export type ScaleGroup = 'basic' | 'modes' | 'minor' | 'pentatonic' | 'other';

export const SCALE_GROUPS: Array<{ id: ScaleGroup; label: string }> = [
    { id: 'basic', label: 'Básicas' },
    { id: 'modes', label: 'Modos de la escala mayor' },
    { id: 'minor', label: 'Menores y derivadas' },
    { id: 'pentatonic', label: 'Pentatónicas y blues' },
    { id: 'other', label: 'Otras' },
];

export type ModeFamilyId = 'major' | 'melodic' | 'harmonic';

/** Escalas madre cuyos modos se pueden listar. */
export const MODE_FAMILIES: Record<ModeFamilyId, { label: string; parent: string; names: string[] }> = {
    major: {
        label: 'escala mayor',
        parent: 'major',
        names: ['Jónica', 'Dórica', 'Frigia', 'Lidia', 'Mixolidia', 'Eólica', 'Locria'],
    },
    melodic: {
        label: 'escala menor melódica',
        parent: 'melodic-minor',
        names: ['Menor melódica', 'Dórica b2', 'Lidia aumentada', 'Lidia dominante', 'Mixolidia b6', 'Locria #2', 'Alterada'],
    },
    harmonic: {
        label: 'escala menor armónica',
        parent: 'harmonic-minor',
        names: ['Menor armónica', 'Locria #6', 'Jónica #5', 'Dórica #4', 'Frigia dominante', 'Lidia #2', 'Superlocria bb7'],
    },
};

export interface ScaleDef {
    id: string;
    name: string;
    group: ScaleGroup;
    /** Grados respecto a la escala mayor: ['1', '2', 'b3', …]. */
    formula: string[];
    description: string;
    /** Si es un modo de una familia: en qué grado de la escala madre nace. */
    mode?: { family: ModeFamilyId; degree: number };
}

export const SCALES: ScaleDef[] = [
    {
        id: 'major', name: 'Mayor', group: 'basic', formula: ['1', '2', '3', '4', '5', '6', '7'], mode: { family: 'major', degree: 1 },
        description: 'La base de la música occidental. Suena estable y brillante.'
    },
    {
        id: 'natural-minor', name: 'Menor natural', group: 'basic', formula: ['1', '2', 'b3', '4', '5', 'b6', 'b7'], mode: { family: 'major', degree: 6 },
        description: 'El sonido menor más habitual: oscuro y melancólico. Es el modo eólico.'
    },

    {
        id: 'dorian', name: 'Dórica', group: 'modes', formula: ['1', '2', 'b3', '4', '5', '6', 'b7'], mode: { family: 'major', degree: 2 },
        description: 'Menor con sexta mayor: más abierta que la menor natural. Típica del funk, el rock y el jazz modal.'
    },
    {
        id: 'phrygian', name: 'Frigia', group: 'modes', formula: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'], mode: { family: 'major', degree: 3 },
        description: 'Menor con segunda menor: oscura y tensa, con aire español.'
    },
    {
        id: 'lydian', name: 'Lidia', group: 'modes', formula: ['1', '2', '3', '#4', '5', '6', '7'], mode: { family: 'major', degree: 4 },
        description: 'Mayor con cuarta aumentada: luminosa y soñadora.'
    },
    {
        id: 'mixolydian', name: 'Mixolidia', group: 'modes', formula: ['1', '2', '3', '4', '5', '6', 'b7'], mode: { family: 'major', degree: 5 },
        description: 'Mayor con séptima menor: sonido de blues, rock y góspel. Es la escala del acorde dominante.'
    },
    {
        id: 'locrian', name: 'Locria', group: 'modes', formula: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'], mode: { family: 'major', degree: 7 },
        description: 'Menor con quinta disminuida: inestable. Se usa sobre el acorde m7b5.'
    },

    {
        id: 'harmonic-minor', name: 'Menor armónica', group: 'minor', formula: ['1', '2', 'b3', '4', '5', 'b6', '7'], mode: { family: 'harmonic', degree: 1 },
        description: 'Menor natural con séptima mayor: crea la sensible y un acorde dominante mayor en tonalidad menor.'
    },
    {
        id: 'melodic-minor', name: 'Menor melódica', group: 'minor', formula: ['1', '2', 'b3', '4', '5', '6', '7'], mode: { family: 'melodic', degree: 1 },
        description: 'Menor con sexta y séptima mayores. Base del jazz moderno; en la tradición clásica solo se usaba al subir.'
    },
    {
        id: 'phrygian-dominant', name: 'Frigia dominante', group: 'minor', formula: ['1', 'b2', '3', '4', '5', 'b6', 'b7'], mode: { family: 'harmonic', degree: 5 },
        description: 'Frigia con tercera mayor: la escala del flamenco y del acorde V7 en tonalidad menor.'
    },
    {
        id: 'lydian-dominant', name: 'Lidia dominante', group: 'minor', formula: ['1', '2', '3', '#4', '5', '6', 'b7'], mode: { family: 'melodic', degree: 4 },
        description: 'Mixolidia con cuarta aumentada. Se usa sobre dominantes con 7#11.'
    },
    {
        id: 'altered', name: 'Alterada', group: 'minor', formula: ['1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'], mode: { family: 'melodic', degree: 7 },
        description: 'Contiene todas las tensiones alteradas del dominante (b9, #9, #11, b13). Se usa sobre V7alt.'
    },

    {
        id: 'major-pentatonic', name: 'Pentatónica mayor', group: 'pentatonic', formula: ['1', '2', '3', '5', '6'],
        description: 'Cinco notas sin semitonos: abierta y consonante. Base de muchas melodías de pop y country.'
    },
    {
        id: 'minor-pentatonic', name: 'Pentatónica menor', group: 'pentatonic', formula: ['1', 'b3', '4', '5', 'b7'],
        description: 'La escala más usada en solos de rock y blues.'
    },
    {
        id: 'blues', name: 'Blues (menor)', group: 'pentatonic', formula: ['1', 'b3', '4', 'b5', '5', 'b7'],
        description: 'Pentatónica menor más la "blue note" (b5).'
    },
    {
        id: 'major-blues', name: 'Blues mayor', group: 'pentatonic', formula: ['1', '2', 'b3', '3', '5', '6'],
        description: 'Pentatónica mayor más la tercera menor como nota de paso.'
    },

    {
        id: 'harmonic-major', name: 'Armónica mayor', group: 'other', formula: ['1', '2', '3', '4', '5', 'b6', '7'],
        description: 'Mayor con sexta menor: color dramático dentro de un contexto mayor.'
    },
    {
        id: 'double-harmonic', name: 'Doble armónica', group: 'other', formula: ['1', 'b2', '3', '4', '5', 'b6', '7'],
        description: 'También llamada bizantina: dos segundas aumentadas, con sabor árabe.'
    },
    {
        id: 'whole-tone', name: 'Tonos enteros', group: 'other', formula: ['1', '2', '3', '#4', '#5', 'b7'],
        description: 'Seis notas a distancia de un tono: sonido flotante y sin resolución.'
    },
    {
        id: 'dim-wh', name: 'Disminuida (tono–semitono)', group: 'other', formula: ['1', '2', 'b3', '4', 'b5', 'b6', '6', '7'],
        description: 'Ocho notas simétricas. Se usa sobre acordes disminuidos (dim7).'
    },
    {
        id: 'dim-hw', name: 'Disminuida (semitono–tono)', group: 'other', formula: ['1', 'b2', 'b3', '3', '#4', '5', '6', 'b7'],
        description: 'Ocho notas simétricas. Se usa sobre dominantes con b9.'
    },
];

export const getScale = (id: string): ScaleDef | undefined => SCALES.find((s) => s.id === id);

export interface BuiltScale {
    def: ScaleDef;
    root: string;
    notes: SpelledNote[];
    /** Distancia en semitonos entre notas consecutivas (la última vuelve a la tónica). */
    steps: number[];
}

/** Construye una escala: escribe cada nota con una letra distinta por grado. */
export function buildScale(root: string, scaleId: string): BuiltScale | null {
    const def = getScale(scaleId);
    const r = parseNote(root);
    if (!def || !r) return null;
    const notes = def.formula.map((token) => spell(r, token));
    const steps = notes.map((n, i) => (notes[i + 1]?.semis ?? 12) - n.semis);
    return { def, root, notes, steps };
}

/** 1 -> S (semitono), 2 -> T (tono), 3 -> T+S (tono y medio). */
export function stepLabel(n: number): string {
    return n === 1 ? 'S' : n === 2 ? 'T' : n === 3 ? 'T+S' : String(n);
}

export interface ModeInfo {
    degree: number;
    name: string;
    root: string;
    notes: string[];
}

/** Modos que salen de empezar la escala madre en cada grado (solo para escalas madre). */
export function modesOf(scale: BuiltScale): ModeInfo[] | null {
    const family = Object.values(MODE_FAMILIES).find((f) => f.parent === scale.def.id);
    if (!family) return null;
    return scale.notes.map((n, i) => ({
        degree: i + 1,
        name: family.names[i] ?? '',
        root: n.name,
        notes: [...scale.notes.slice(i), ...scale.notes.slice(0, i)].map((x) => x.name),
    }));
}

/** Si la escala es un modo, de qué escala madre sale: "Dórica de C = modo II de Bb mayor". */
export function parentOf(scale: BuiltScale): { degree: number; root: string; name: string; family: string } | null {
    const mode = scale.def.mode;
    if (!mode || mode.degree === 1) return null;
    const family = MODE_FAMILIES[mode.family];
    const parent = getScale(family.parent);
    const r = parseNote(scale.root);
    const token = parent?.formula[mode.degree - 1];
    if (!parent || !r || !token) return null;
    const pc = mod(r.pc - degreeSemitones(token), 12);
    return {
        degree: mode.degree,
        root: noteName(r.letter - (mode.degree - 1), pc),
        name: parent.name,
        family: family.label,
    };
}