'use client';

import type { SongView } from '@/config/routes';
import { SONG_FORMAT_LIST } from '@/features/songs/formats';
import Select from '@/shared/ui/Select';

interface SongTabsProps {
    view: SongView;
    onChange: (view: SongView) => void;
    /** Qué formatos tienen contenido (los que no tienen se atenúan). */
    available: Record<SongView, boolean>;
}

/** Selector del formato de la canción (Cifrado / Chart). */
export default function SongTabs({ view, onChange, available }: SongTabsProps) {
    return (
        <div className="song-tabs">
            <Select
                label="Vista de la canción"
                className="song-view-select"
                align="start"
                value={view}
                onChange={onChange}
                options={SONG_FORMAT_LIST.map((format) => ({
                    value: format.id,
                    label: format.label,
                    muted: !available[format.id],
                }))}
            />
        </div>
    );
}