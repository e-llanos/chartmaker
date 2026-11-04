export type TheoryTab = 'scales' | 'chords' | 'harmony' | 'notes' | 'symbols';

export const THEORY_TABS: ReadonlyArray<{ id: TheoryTab; label: string }> = [
    { id: 'scales', label: 'Escalas' },
    { id: 'chords', label: 'Acordes' },
    { id: 'harmony', label: 'Armonía' },
    { id: 'notes', label: 'Notas' },
    { id: 'symbols', label: 'Simbología' },
];

/** Lee `?tab=` con tolerancia: cualquier valor desconocido abre las escalas. */
export function parseTheoryTab(value: unknown): TheoryTab {
    const v = Array.isArray(value) ? value[0] : value;
    return THEORY_TABS.some((t) => t.id === v) ? (v as TheoryTab) : 'scales';
}