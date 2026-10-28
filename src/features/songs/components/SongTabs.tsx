'use client';

import type { SongView } from '@/config/routes';

interface SongTabsProps {
    view: SongView;
    onChange: (view: SongView) => void;
    /** Qué recursos tienen contenido (el cifrado siempre se considera disponible). */
    available: Record<SongView, boolean>;
}

const TABS: ReadonlyArray<{ view: SongView; label: string }> = [
    { view: 'cifrado', label: 'Cifrado' },
    { view: 'chart', label: 'Chart' },
    { view: 'advanced', label: 'Chart avanzado' },
];

export default function SongTabs({ view, onChange, available }: SongTabsProps) {
    return (
        <nav className="song-tabs" aria-label="Vista de la canción">
            {TABS.map((t) => (
                <button
                    key={t.view}
                    type="button"
                    className={`song-tab${available[t.view] ? '' : ' muted'}`}
                    aria-current={view === t.view ? 'true' : undefined}
                    onClick={() => onChange(t.view)}
                >
                    {t.label}
                </button>
            ))}
        </nav>
    );
}