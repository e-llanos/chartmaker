import type { z } from 'zod';
import type { Chart } from '@/domain/chart/types';
import type { SongInput, SongUpdate } from '@/domain/song/types';
import type { chartSchema } from './chart';
import type { songInputSchema, songUpdateSchema } from './song';

/** `true` si A y B son asignables entre sí. */
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

/**
 * Los tipos de `domain` son la fuente de verdad; los esquemas deben producir exactamente esos tipos.
 * Si uno cambia sin el otro, alguna de estas líneas deja de compilar y el error señala el campo.
 */
export const conformance = {
    chart: true,
    songInput: true,
    songUpdate: true,
} satisfies {
    chart: Same<z.output<typeof chartSchema>, Chart>;
    songInput: Same<z.output<typeof songInputSchema>, SongInput>;
    songUpdate: Same<z.output<typeof songUpdateSchema>, SongUpdate>;
};