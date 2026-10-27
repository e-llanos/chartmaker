import type { Chart, ChartMeasure, ChartSection } from '@/lib/chart/chart.types';
import { SECTION_TYPES, type SectionType } from '@/lib/sections/sectionTypes';
import { DEFAULT_SONG_INPUT, TEMPO_MAX, TEMPO_MIN } from './song.constants';
import type { SongCreate, SongUpdate } from './song.types';
import {
    MEASURE_MARK_KEYS,
    type LeftBar,
    type MeasureMark,
    type RightBar,
    type Score,
    type ScoreMeasure,
    type ScoreSection,
} from '@/lib/score/score.types';

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/* ---------- Límites ---------- */

const TEXT_MAX = {
    title: 200,
    artist: 200,
    album: 200,
    key: 4,
    compas: 6,
    body: 200_000,
} as const;

const CHART_LIMITS = { sections: 80, measures: 256, beats: 12, beatLen: 24, text: 200 } as const;

const TEXT_FIELDS = ['title', 'artist', 'album', 'key', 'compas', 'body'] as const;

const KEY_FORMAT = /^[A-G][#b]?m?$/;
const COMPAS_FORMAT = /^\d{1,2}\/\d{1,2}$/;

/* ---------- Chart ---------- */

function isSectionType(v: unknown): v is SectionType {
    return typeof v === 'string' && Object.prototype.hasOwnProperty.call(SECTION_TYPES, v);
}

function intInRange(v: unknown, min: number, max: number): v is number {
    return typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
}

function parseMeasure(data: unknown): ChartMeasure | null {
    if (!data || typeof data !== 'object') return null;
    const { beats, repeat } = data as Record<string, unknown>;
    if (!Array.isArray(beats) || beats.length < 1 || beats.length > CHART_LIMITS.beats) return null;
    if (!beats.every((b) => typeof b === 'string' && b.length <= CHART_LIMITS.beatLen)) return null;
    const r: unknown = repeat === undefined ? 1 : repeat;
    if (!intInRange(r, 1, 99)) return null;
    return { beats: beats as string[], ...(r > 1 ? { repeat: r } : {}) };
}

function parseSection(data: unknown): ChartSection | null {
    if (!data || typeof data !== 'object') return null;
    const s = data as Record<string, unknown>;
    if (typeof s.id !== 'string' || !s.id || s.id.length > 64) return null;
    if (!isSectionType(s.type)) return null;
    if (typeof s.label !== 'string' || s.label.length > CHART_LIMITS.text) return null;
    if (typeof s.note !== 'string' || s.note.length > CHART_LIMITS.text) return null;
    if (!intInRange(s.repeat, 1, 99)) return null;
    if (!Array.isArray(s.measures) || s.measures.length > CHART_LIMITS.measures) return null;

    const measures: ChartMeasure[] = [];
    for (const m of s.measures) {
        const parsed = parseMeasure(m);
        if (!parsed) return null;
        measures.push(parsed);
    }
    return { id: s.id, type: s.type, label: s.label, note: s.note, repeat: s.repeat, measures };
}

export function parseChart(data: unknown): Result<Chart> {
    const invalid: Result<Chart> = { ok: false, error: 'Chart inválido' };
    if (!data || typeof data !== 'object') return invalid;
    const { sections } = data as Record<string, unknown>;
    if (!Array.isArray(sections) || sections.length > CHART_LIMITS.sections) return invalid;

    const out: ChartSection[] = [];
    const ids = new Set<string>();
    for (const s of sections) {
        const parsed = parseSection(s);
        if (!parsed || ids.has(parsed.id)) return invalid; // los ids deben ser únicos
        ids.add(parsed.id);
        out.push(parsed);
    }
    return { ok: true, value: { sections: out } };
}

/* ---------- Chart avanzado ---------- */

const isLeft = (v: unknown): v is LeftBar => v === 'double' || v === 'repeat';
const isRight = (v: unknown): v is RightBar => v === 'double' || v === 'final' || v === 'repeat';
const isEnding = (v: unknown): v is 1 | 2 | 3 => v === 1 || v === 2 || v === 3;
const isMark = (v: unknown): v is MeasureMark =>
    typeof v === 'string' && (MEASURE_MARK_KEYS as string[]).includes(v);

function parseScoreMeasure(data: unknown): ScoreMeasure | null {
    if (!data || typeof data !== 'object') return null;
    const m = data as Record<string, unknown>;
    const { beats } = m;
    if (!Array.isArray(beats) || beats.length < 1 || beats.length > CHART_LIMITS.beats) return null;
    if (!beats.every((b) => typeof b === 'string' && b.length <= CHART_LIMITS.beatLen)) return null;

    const out: ScoreMeasure = { beats: beats as string[] };

    if (m.left !== undefined) {
        if (!isLeft(m.left)) return null;
        out.left = m.left;
    }
    if (m.right !== undefined) {
        if (!isRight(m.right)) return null;
        out.right = m.right;
    }
    if (m.ending !== undefined) {
        if (!isEnding(m.ending)) return null;
        out.ending = m.ending;
    }
    if (m.simile !== undefined) {
        if (typeof m.simile !== 'boolean') return null;
        if (m.simile) out.simile = true;
    }
    if (m.marks !== undefined) {
        if (!Array.isArray(m.marks) || m.marks.length > 9 || !m.marks.every(isMark)) return null;
        const marks = Array.from(new Set(m.marks as MeasureMark[]));
        if (marks.length) out.marks = marks;
    }
    if (m.note !== undefined) {
        if (typeof m.note !== 'string' || m.note.length > 80) return null;
        if (m.note) out.note = m.note;
    }
    return out;
}

function parseScoreSection(data: unknown): ScoreSection | null {
    if (!data || typeof data !== 'object') return null;
    const s = data as Record<string, unknown>;
    if (typeof s.id !== 'string' || !s.id || s.id.length > 64) return null;
    if (!isSectionType(s.type)) return null;
    if (typeof s.label !== 'string' || s.label.length > CHART_LIMITS.text) return null;
    if (typeof s.note !== 'string' || s.note.length > CHART_LIMITS.text) return null;
    if (!intInRange(s.repeat, 1, 99)) return null;
    if (!intInRange(s.perRow, 2, 8)) return null;
    if (!Array.isArray(s.measures) || s.measures.length > CHART_LIMITS.measures) return null;

    const measures: ScoreMeasure[] = [];
    for (const m of s.measures) {
        const parsed = parseScoreMeasure(m);
        if (!parsed) return null;
        measures.push(parsed);
    }
    return {
        id: s.id, type: s.type, label: s.label, note: s.note,
        repeat: s.repeat, perRow: s.perRow, measures,
    };
}

export function parseScore(data: unknown): Result<Score> {
    const invalid: Result<Score> = { ok: false, error: 'Chart avanzado inválido' };
    if (!data || typeof data !== 'object') return invalid;
    const { sections } = data as Record<string, unknown>;
    if (!Array.isArray(sections) || sections.length > CHART_LIMITS.sections) return invalid;

    const out: ScoreSection[] = [];
    const ids = new Set<string>();
    for (const s of sections) {
        const parsed = parseScoreSection(s);
        if (!parsed || ids.has(parsed.id)) return invalid;
        ids.add(parsed.id);
        out.push(parsed);
    }
    return { ok: true, value: { sections: out } };
}

/* ---------- Canción ---------- */

/** Valida un objeto parcial: solo se incluyen los campos presentes. */
export function parseSongUpdate(data: unknown): Result<SongUpdate> {
    if (!data || typeof data !== 'object') return { ok: false, error: 'JSON inválido' };
    const src = data as Record<string, unknown>;
    const out: SongUpdate = {};

    for (const field of TEXT_FIELDS) {
        const v = src[field];
        if (v === undefined) continue;
        if (typeof v !== 'string') return { ok: false, error: `"${field}" debe ser texto` };
        if (v.length > TEXT_MAX[field]) {
            return { ok: false, error: `"${field}" es demasiado largo (máximo ${TEXT_MAX[field]} caracteres)` };
        }
        out[field] = v;
    }

    if (out.title !== undefined && !out.title.trim()) {
        return { ok: false, error: 'El título no puede estar vacío' };
    }
    if (out.key !== undefined && !KEY_FORMAT.test(out.key)) {
        return { ok: false, error: '"key" no es una tonalidad válida (ej. G, F#, Am)' };
    }
    if (out.compas !== undefined && !COMPAS_FORMAT.test(out.compas)) {
        return { ok: false, error: '"compas" debe tener formato 4/4, 6/8…' };
    }

    if (src.imageUrl !== undefined) {
        if (typeof src.imageUrl !== 'string') return { ok: false, error: '"imageUrl" debe ser texto' };
        const url = src.imageUrl.trim();
        // http(s):// o ruta local con un solo "/" (se rechaza "//dominio", que es externo)
        if (url && !/^(https?:\/\/|\/(?!\/))/i.test(url)) {
            return { ok: false, error: '"imageUrl" debe empezar por http(s):// o /' };
        }
        out.imageUrl = url; // '' = quitar la imagen
    }

    if (src.tempo !== undefined) {
        const t = src.tempo;
        if (!intInRange(t, TEMPO_MIN, TEMPO_MAX)) {
            return { ok: false, error: `"tempo" debe ser un entero entre ${TEMPO_MIN} y ${TEMPO_MAX}` };
        }
        out.tempo = t;
    }

    if (src.chart !== undefined) {
        if (src.chart === null) {
            out.chart = null;
        } else {
            const chart = parseChart(src.chart);
            if (!chart.ok) return chart;
            out.chart = chart.value;
        }
    }

    if (src.score !== undefined) {
        if (src.score === null) {
            out.score = null;
        } else {
            const score = parseScore(src.score);
            if (!score.ok) return score;
            out.score = score.value;
        }
    }

    return { ok: true, value: out };
}

/** Valida una canción nueva: completa los campos que falten con valores por defecto. */
export function parseSongInput(data: unknown): Result<SongCreate> {
    const parsed = parseSongUpdate(data);
    if (!parsed.ok) return parsed;
    const { chart, score, ...rest } = parsed.value;
    const value: SongCreate = {
        ...DEFAULT_SONG_INPUT,
        ...rest,
        ...(chart ? { chart } : {}),
        ...(score ? { score } : {}),
    };
    if (!value.title.trim()) return { ok: false, error: 'El título es obligatorio' };
    return { ok: true, value };
}