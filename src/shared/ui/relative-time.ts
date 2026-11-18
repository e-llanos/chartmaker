const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
];

/** "hace 8 meses", "ayer"… Las canciones sin fecha real (antes de 2000) devuelven "—". */
export function timeAgo(iso: string, now = Date.now()): string {
    const time = new Date(iso).getTime();
    if (Number.isNaN(time) || time < Date.UTC(2000, 0, 1)) return '—';

    const seconds = Math.round((time - now) / 1000);
    const format = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
    for (const [unit, size] of UNITS) {
        if (Math.abs(seconds) >= size) return format.format(Math.trunc(seconds / size), unit);
    }
    return 'ahora';
}