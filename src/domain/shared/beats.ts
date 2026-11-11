/** Rellena con vacíos hasta `count` tiempos, sin recortar los existentes. */
export function padBeats(beats: string[], count: number): string[] {
    return Array.from({ length: Math.max(count, beats.length) }, (_, i) => beats[i] ?? '');
}
