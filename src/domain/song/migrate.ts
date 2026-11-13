import { DEFAULT_PER_ROW } from '@/domain/chart/types';

/** Versión del formato de los datos guardados. 2 = un solo chart con estilo. */
export const SCHEMA_VERSION = 2;

type Raw = Record<string, unknown>;

const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);

const sectionsOf = (chart: unknown): Raw[] =>
    isObject(chart) && Array.isArray(chart.sections) ? chart.sections.filter(isObject) : [];

const measuresOf = (section: Raw): Raw[] =>
    Array.isArray(section.measures) ? section.measures.filter(isObject) : [];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** ¿Tienen las mismas secciones, el mismo número de compases y los mismos acordes? */
function sameChords(a: unknown, b: unknown): boolean {
    const sa = sectionsOf(a);
    const sb = sectionsOf(b);
    if (sa.length !== sb.length) return false;
    return sa.every((section, i) => {
        const ma = measuresOf(section);
        const mb = measuresOf(sb[i] ?? {});
        return ma.length === mb.length && ma.every((m, j) => JSON.stringify(m.beats) === JSON.stringify(mb[j]?.beats));
    });
}

/** Deja un chart antiguo en la forma actual: con estilo y con compases por fila. */
function withStyle(chart: unknown, style: 'simple' | 'advanced'): Raw {
    const sections = clone(sectionsOf(chart)).map((s) => ({
        ...s,
        perRow: typeof s.perRow === 'number' ? s.perRow : DEFAULT_PER_ROW,
    }));
    return { style, sections };
}

export interface MergedChart {
    chart: Raw | undefined;
    /** Había chart y chart avanzado con acordes distintos: se conservó el avanzado. */
    divergent: boolean;
}

/**
 * Une el chart y el chart avanzado de la versión 1 en un solo chart.
 *  - Solo uno de los dos: se conserva, con el estilo que tenía.
 *  - Los dos con los mismos acordes: gana el avanzado, más el ×N de cada compás del chart.
 *  - Los dos con acordes distintos: gana el avanzado (el otro queda en la copia de seguridad).
 */
export function mergeLegacyChart(chart: unknown, score: unknown): MergedChart {
    if (sectionsOf(score).length === 0) {
        return { chart: isObject(chart) ? withStyle(chart, 'simple') : undefined, divergent: false };
    }
    const merged = withStyle(score, 'advanced');
    if (sectionsOf(chart).length === 0) return { chart: merged, divergent: false };
    if (!sameChords(chart, score)) return { chart: merged, divergent: true };

    const chartSections = sectionsOf(chart);
    sectionsOf(merged).forEach((section, i) => {
        const original = measuresOf(chartSections[i] ?? {});
        measuresOf(section).forEach((measure, j) => {
            const repeat = original[j]?.repeat;
            if (typeof repeat === 'number' && repeat > 1 && measure.repeat === undefined) measure.repeat = repeat;
        });
    });
    return { chart: merged, divergent: false };
}

export interface MigratedSong {
    song: Raw;
    changed: boolean;
    divergent: boolean;
}

/** Lleva una canción guardada a la versión actual. Si ya lo está, la devuelve igual. */
export function migrateSong(raw: Raw): MigratedSong {
    const version = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 1;
    if (version >= SCHEMA_VERSION) return { song: raw, changed: false, divergent: false };

    const { chart, score, ...rest } = raw;
    const merged = mergeLegacyChart(chart, score);
    return {
        song: { ...rest, schemaVersion: SCHEMA_VERSION, ...(merged.chart ? { chart: merged.chart } : {}) },
        changed: true,
        divergent: merged.divergent,
    };
}