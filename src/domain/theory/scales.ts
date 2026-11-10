import { degreeSemitones, mod, noteName, parseNote, spell, type SpelledNote } from '@/domain/music/core';

export type ScaleGroup = 'basic' | 'modes' | 'melodic' | 'harmonic' | 'pentatonic' | 'other';

export const SCALE_GROUPS: Array<{ id: ScaleGroup; label: string }> = [
    { id: 'basic', label: 'Básicas' },
    { id: 'modes', label: 'Modos de la escala mayor' },
    { id: 'melodic', label: 'Menor melódica y sus modos' },
    { id: 'harmonic', label: 'Menor armónica y sus modos' },
    { id: 'pentatonic', label: 'Pentatónicas y blues' },
    { id: 'other', label: 'Otras' },
];

export type ModeFamilyId = 'major' | 'melodic' | 'harmonic';

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

/* ---------- Modos: una sola tabla ---------- */

interface ModeEntry {
    id: string;
    name: string;
    /** Nombre dentro de la lista de modos, si difiere del de la escala (Mayor = Jónica). */
    modeName?: string;
    group: ScaleGroup;
    description: string;
}

interface FamilyDef {
    label: string;
    /** Fórmula de la escala madre; la de cada modo sale de rotarla. */
    parent: string[];
    /** Un modo por grado de la escala madre, en orden. */
    modes: ModeEntry[];
}

const FAMILIES: Record<ModeFamilyId, FamilyDef> = {
    major: {
        label: 'escala mayor',
        parent: ['1', '2', '3', '4', '5', '6', '7'],
        modes: [
            { id: 'major', name: 'Mayor', modeName: 'Jónica', group: 'basic', description: 'La base de la música occidental. Suena estable y brillante.' },
            { id: 'dorian', name: 'Dórica', group: 'modes', description: 'Menor con sexta mayor: más abierta que la menor natural. Típica del funk, el rock y el jazz modal.' },
            { id: 'phrygian', name: 'Frigia', group: 'modes', description: 'Menor con segunda menor: oscura y tensa, con aire español.' },
            { id: 'lydian', name: 'Lidia', group: 'modes', description: 'Mayor con cuarta aumentada: luminosa y soñadora.' },
            { id: 'mixolydian', name: 'Mixolidia', group: 'modes', description: 'Mayor con séptima menor: sonido de blues, rock y góspel. Es la escala del acorde dominante.' },
            { id: 'natural-minor', name: 'Menor natural', modeName: 'Eólica', group: 'basic', description: 'El sonido menor más habitual: oscuro y melancólico. Es el modo eólico.' },
            { id: 'locrian', name: 'Locria', group: 'modes', description: 'Menor con quinta disminuida: inestable. Se usa sobre el acorde m7b5.' },
        ],
    },
    melodic: {
        label: 'escala menor melódica',
        parent: ['1', '2', 'b3', '4', '5', '6', '7'],
        modes: [
            { id: 'melodic-minor', name: 'Menor melódica', group: 'melodic', description: 'Menor con sexta y séptima mayores. Base del jazz moderno; en la tradición clásica solo se usaba al subir.' },
            { id: 'dorian-b2', name: 'Dórica b2', group: 'melodic', description: 'Dórica con segunda menor (también frigia #6): menor con sexta mayor y un arranque tenso. Segundo modo de la menor melódica.' },
            { id: 'lydian-augmented', name: 'Lidia aumentada', group: 'melodic', description: 'Lidia con quinta aumentada: luminosa y flotante. Tercer modo de la menor melódica; se usa sobre acordes maj7#5.' },
            { id: 'lydian-dominant', name: 'Lidia dominante', group: 'melodic', description: 'Mixolidia con cuarta aumentada. Se usa sobre dominantes con 7#11.' },
            { id: 'mixolydian-b6', name: 'Mixolidia b6', group: 'melodic', description: 'Mixolidia con sexta menor (eólica dominante o escala hindú). Quinto modo de la menor melódica; se usa sobre dominantes con b13.' },
            { id: 'locrian-s2', name: 'Locria #2', group: 'melodic', description: 'Locria con segunda mayor (semilocria): más suave que la locria. Sexto modo de la menor melódica y escala habitual sobre el acorde m7b5.' },
            { id: 'altered', name: 'Alterada', group: 'melodic', description: 'Contiene todas las tensiones alteradas del dominante (b9, #9, #11, b13). Se usa sobre V7alt.' },
        ],
    },
    harmonic: {
        label: 'escala menor armónica',
        parent: ['1', '2', 'b3', '4', '5', 'b6', '7'],
        modes: [
            { id: 'harmonic-minor', name: 'Menor armónica', group: 'harmonic', description: 'Menor natural con séptima mayor: crea la sensible y un acorde dominante mayor en tonalidad menor.' },
            { id: 'locrian-s6', name: 'Locria #6', group: 'harmonic', description: 'Locria con sexta mayor. Segundo modo de la menor armónica: aparece sobre el acorde ii° de una tonalidad menor.' },
            { id: 'ionian-s5', name: 'Jónica #5', group: 'harmonic', description: 'Mayor con quinta aumentada. Tercer modo de la menor armónica; se usa sobre acordes aumentados (maj7#5).' },
            { id: 'dorian-s4', name: 'Dórica #4', group: 'harmonic', description: 'Dórica con cuarta aumentada (dórica ucraniana o menor rumana). Cuarto modo de la menor armónica, típica de la música del este de Europa.' },
            { id: 'phrygian-dominant', name: 'Frigia dominante', group: 'harmonic', description: 'Frigia con tercera mayor: la escala del flamenco y del acorde V7 en tonalidad menor.' },
            { id: 'lydian-s2', name: 'Lidia #2', group: 'harmonic', description: 'Lidia con segunda aumentada. Sexto modo de la menor armónica: muy luminosa y poco frecuente.' },
            { id: 'superlocrian-bb7', name: 'Superlocria bb7', group: 'harmonic', description: 'Séptimo modo de la menor armónica: locria con séptima doblemente disminuida. Sus notas son las del acorde dim7.' },
        ],
    },
};

/** Escalas madre cuyos modos se pueden listar. Se deriva de la tabla de modos. */
export const MODE_FAMILIES = Object.fromEntries(
    Object.entries(FAMILIES).map(([id, f]) => [
        id,
        { label: f.label, parent: f.modes[0]?.id ?? '', names: f.modes.map((m) => m.modeName ?? m.name) },
    ]),
) as Record<ModeFamilyId, { label: string; parent: string; names: string[] }>;

/** Fórmula del modo que empieza en `degree` (1-7) de la escala madre: se reescribe respecto a su nueva tónica. */
function rotate(parent: string[], degree: number): string[] {
    const start = degreeSemitones(parent[degree - 1] ?? '1');
    return parent.map((_, j) => {
        const semis = mod(degreeSemitones(parent[(degree - 1 + j) % parent.length] ?? '1') - start, 12);
        const alt = semis - degreeSemitones(String(j + 1));
        return (alt > 0 ? '#'.repeat(alt) : 'b'.repeat(-alt)) + (j + 1);
    });
}

const MODE_SCALES: ScaleDef[] = (Object.entries(FAMILIES) as Array<[ModeFamilyId, FamilyDef]>).flatMap(
    ([family, def]) =>
        def.modes.map((m, i) => ({
            id: m.id,
            name: m.name,
            group: m.group,
            formula: rotate(def.parent, i + 1),
            description: m.description,
            mode: { family, degree: i + 1 },
        })),
);

/** Escalas que no son modos de ninguna familia. */
const OTHER_SCALES: ScaleDef[] = [
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

const GROUP_ORDER = SCALE_GROUPS.map((g) => g.id);

/** Todas las escalas, agrupadas en el orden de SCALE_GROUPS y, dentro de cada grupo, por grado del modo. */
export const SCALES: ScaleDef[] = [...MODE_SCALES, ...OTHER_SCALES].sort(
    (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group),
);

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