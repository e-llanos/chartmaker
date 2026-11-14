import { z } from 'zod';
import { CHART_LIMITS, CHART_STYLES, DEFAULT_PER_ROW, MEASURE_MARK_KEYS } from '@/domain/chart/constants';
import type { Chart } from '@/domain/chart/types';
import { tidyChart } from '@/domain/chart/utils';
import { SECTION_TYPES, type SectionType } from '@/domain/sections/section-types';
import { describeIssue } from './issues';
import type { Result } from './result';

const SECTION_TYPE_KEYS = Object.keys(SECTION_TYPES) as [SectionType, ...SectionType[]];

const measureSchema = z.object({
    /** Un acorde por tiempo ('' = sin acorde). */
    beats: z
        .array(z.string().max(CHART_LIMITS.beatLen, 'Un acorde es demasiado largo'))
        .min(1, 'Un compás necesita al menos un tiempo')
        .max(CHART_LIMITS.beats, `Un compás admite como máximo ${CHART_LIMITS.beats} tiempos`),
    repeat: z.number().int().min(1).max(CHART_LIMITS.repeat).optional(),
    left: z.enum(['double', 'repeat']).optional(),
    right: z.enum(['double', 'final', 'repeat']).optional(),
    ending: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
    simile: z.boolean().optional(),
    marks: z.array(z.enum(MEASURE_MARK_KEYS)).max(CHART_LIMITS.marks).optional(),
    note: z.string().max(CHART_LIMITS.measureNote).optional(),
});

const sectionSchema = z.object({
    id: z.string().min(1).max(64),
    type: z.enum(SECTION_TYPE_KEYS),
    label: z.string().max(CHART_LIMITS.text, 'La etiqueta es demasiado larga'),
    note: z.string().max(CHART_LIMITS.text, 'La nota es demasiado larga'),
    repeat: z.number().int().min(1).max(CHART_LIMITS.repeat),
    perRow: z.number().int().min(2).max(8).default(DEFAULT_PER_ROW),
    measures: z.array(measureSchema).max(CHART_LIMITS.measures, 'Demasiados compases en una sección'),
});

export const chartSchema = z
    .object({
        style: z.enum(CHART_STYLES).default('simple'),
        sections: z.array(sectionSchema).max(CHART_LIMITS.sections, 'Demasiadas secciones'),
    })
    .refine((chart) => new Set(chart.sections.map((s) => s.id)).size === chart.sections.length, {
        message: 'Los ids de sección deben ser únicos',
        path: ['sections'],
    });

/** Valida un chart (importación o API) y lo deja sin valores vacíos. */
export function parseChart(data: unknown): Result<Chart> {
    const parsed = chartSchema.safeParse(data);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return { ok: false, error: issue ? describeIssue(issue, true) : 'Chart inválido' };
    }
    return { ok: true, value: tidyChart(parsed.data) };
}