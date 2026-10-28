/** Tiempos por compás: 4/4 -> 4, 3/4 -> 3, 6/8 -> 2, 12/8 -> 4. */
export function beatsPerMeasure(compas: string): number {
    const m = compas.match(/^(\d{1,2})\s*\/\s*(\d{1,2})$/);
    if (!m) return 4;
    const n = Number(m[1]);
    const d = Number(m[2]);
    const beats = d === 8 && n % 3 === 0 ? n / 3 : n;
    return Math.max(1, Math.min(8, beats));
}

/** Rellena con vacíos hasta `count` tiempos, sin recortar los existentes. */
export function padBeats(beats: string[], count: number): string[] {
    return Array.from({ length: Math.max(count, beats.length) }, (_, i) => beats[i] ?? '');
}
