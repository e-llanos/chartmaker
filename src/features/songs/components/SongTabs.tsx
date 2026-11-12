'use client';

import type { SongView } from '@/config/routes';
import { SONG_FORMAT_LIST } from '@/features/songs/formats';

interface SongTabsProps {
    view: SongView;
    onChange: (view: SongView) => void;
    /** Qué formatos tienen contenido (las pestañas sin contenido se atenúan). */
    available: Record<SongView, boolean>;
}

export default function SongTabs({ view, onChange, available }: SongTabsProps) {
    return (
        <nav className="song-tabs" aria-label="Vista de la canción">
            {SONG_FORMAT_LIST.map((format) => (
                <button
                    key={format.id}
                    type="button"
                    className={`song-tab${available[format.id] ? '' : ' muted'}`}
                    aria-current={view === format.id ? 'true' : undefined}
                    onClick={() => onChange(format.id)}
                >
                    {format.label}
                </button>
            ))}
        </nav>
    );
}