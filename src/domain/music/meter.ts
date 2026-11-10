import {
    DEFAULT_TIME_SIGNATURE,
    parseTimeSignature,
    slotsPerMeasure,
    type SlotMode,
} from '@/domain/music/core/meter';

/**
 * Casillas por compás de un texto de compás. Por pulsos (4/4 -> 4, 6/8 -> 2, 12/8 -> 4)
 * o, con `mode: 'subdivisions'`, por corcheas (6/8 -> 6). Un compás inválido cuenta como 4/4.
 */
export function beatsPerMeasure(compas: string, mode: SlotMode = 'pulses'): number {
    return slotsPerMeasure(parseTimeSignature(compas) ?? DEFAULT_TIME_SIGNATURE, mode);
}

/** Rellena con vacíos hasta `count` tiempos, sin recortar los existentes. */
export function padBeats(beats: string[], count: number): string[] {
    return Array.from({ length: Math.max(count, beats.length) }, (_, i) => beats[i] ?? '');
}
