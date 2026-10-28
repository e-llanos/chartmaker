/**
 * Tipos de sección compartidos por Cifrado y Chart.
 * `type` es también el nombre de la directiva ChordPro: {start_of_verse: Verso 1}
 */

export interface SectionTypeConfig {
    label: string;
    abbr: string;
    color: string;
    numbered?: boolean;
}

export const SECTION_TYPES = {
    intro: { label: 'Intro', abbr: 'I', color: '#3fb5a6' },
    verse: { label: 'Verso', abbr: 'V', color: '#8a74e8', numbered: true },
    prechorus: { label: 'Pre coro', abbr: 'Pr', color: '#d9a93f' },
    chorus: { label: 'Coro', abbr: 'C', color: '#e0684a' },
    bridge: { label: 'Puente', abbr: 'P', color: '#d9628f' },
    interlude: { label: 'Interludio', abbr: 'It', color: '#5aa0e0' },
    refrain: { label: 'Estribillo', abbr: 'Rf', color: '#7fbf5a' },
    instrumental: { label: 'Instrumental', abbr: 'In', color: '#8e9aaf' },
    tag: { label: 'Tag', abbr: 'T', color: '#b8895a' },
    outro: { label: 'Final', abbr: 'F', color: '#3fb5a6' },
} as const satisfies Record<string, SectionTypeConfig>;

export type SectionType = keyof typeof SECTION_TYPES;

export const SECTION_TYPE_KEYS = Object.keys(SECTION_TYPES) as SectionType[];

export interface Section {
    id: string | number;
    type: SectionType;
}

export interface Badge {
    id: Section['id'];
    text: string;
    color: string;
}

/** Etiqueta sugerida para una sección nueva: "Verso 2", "Coro", "Coro 2"... */
export function nextLabel(type: SectionType, existingCount: number): string {
    const t: SectionTypeConfig = SECTION_TYPES[type];
    return existingCount || t.numbered ? `${t.label} ${existingCount + 1}` : t.label;
}

/** Texto de la insignia circular de cada sección (V1, V2, C, Pr...). */
export function computeBadges(sections: Section[]): Badge[] {
    const counts: Partial<Record<SectionType, number>> = {};
    return sections.map((s) => {
        const t: SectionTypeConfig = SECTION_TYPES[s.type] ?? SECTION_TYPES.verse;
        counts[s.type] = (counts[s.type] ?? 0) + 1;
        return {
            id: s.id,
            text: t.numbered ? `${t.abbr}${counts[s.type]}` : t.abbr,
            color: t.color,
        };
    });
}