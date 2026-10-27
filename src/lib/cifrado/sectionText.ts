import { SECTION_TYPES, type SectionType } from '@/lib/sections/sectionTypes';

export const REPEAT_MIN = 1;
export const REPEAT_MAX = 99;

export interface SectionRepeatInfo {
    label: string;
    repeat: number;
}

const START = /^\{\s*start_of_(\w+)\s*(?::\s*(.*?))?\s*\}$/i;
const END = /^\{\s*end_of_\w+\s*\}$/i;
const REPEAT = /^\{\s*repeat\s*:\s*(\d+)\s*\}$/i;

interface Located {
    start: number;
    repeatLine: number;
    repeat: number;
    label: string;
}

function lineIndexAt(body: string, pos: number): number {
    return body.slice(0, pos).split('\n').length - 1;
}

/** Busca la sección que contiene la línea `at`; null si el cursor está fuera de una. */
function locate(lines: string[], at: number): Located | null {
    let start = -1;
    for (let i = at; i >= 0; i--) {
        const t = (lines[i] ?? '').trim();
        if (START.test(t)) { start = i; break; }
        if (i < at && END.test(t)) return null;
    }
    if (start < 0) return null;

    let repeatLine = -1;
    let repeat = 1;
    for (let i = start + 1; i < lines.length; i++) {
        const t = (lines[i] ?? '').trim();
        if (START.test(t)) break;
        const r = t.match(REPEAT);
        if (r && repeatLine < 0) { repeatLine = i; repeat = Number(r[1]); }
        if (END.test(t)) break;
    }

    const m = (lines[start] ?? '').trim().match(START);
    const type = (m?.[1] ?? '').toLowerCase();
    const known = Object.prototype.hasOwnProperty.call(SECTION_TYPES, type);
    const fallback = known ? SECTION_TYPES[type as SectionType].label : type;
    return { start, repeatLine, repeat, label: m?.[2] || fallback };
}

/** Repeticiones de la sección bajo el cursor (null si no hay ninguna). */
export function getSectionRepeat(body: string, caret: number): SectionRepeatInfo | null {
    const found = locate(body.split('\n'), lineIndexAt(body, caret));
    return found ? { label: found.label, repeat: found.repeat } : null;
}

/** Aplica `n` repeticiones a la sección bajo el cursor. */
export function setSectionRepeat(
    body: string,
    caret: number,
    n: number,
): { body: string; caret: number } | null {
    const value = Math.max(REPEAT_MIN, Math.min(REPEAT_MAX, Math.round(n)));
    const lines = body.split('\n');
    const found = locate(lines, lineIndexAt(body, caret));
    if (!found) return null;

    const offsetOf = (line: number) =>
        lines.slice(0, line).reduce((sum, l) => sum + l.length + 1, 0);
    const next = `{repeat: ${value}}`;
    let at = 0;
    let delta = 0;

    if (found.repeatLine >= 0) {
        at = offsetOf(found.repeatLine);
        const oldLen = (lines[found.repeatLine] ?? '').length;
        if (value === 1) {
            lines.splice(found.repeatLine, 1);
            delta = -(oldLen + 1);
        } else {
            lines[found.repeatLine] = next;
            delta = next.length - oldLen;
        }
    } else if (value > 1) {
        at = offsetOf(found.start + 1);
        lines.splice(found.start + 1, 0, next);
        delta = next.length + 1;
    } else {
        return { body, caret };
    }

    return { body: lines.join('\n'), caret: at <= caret ? Math.max(at, caret + delta) : caret };
}