'use client';

import { useMemo, useState } from 'react';
import { toSongInput } from '@/domain/song/constants';
import type { Song } from '@/domain/song/types';
import { songEditPath, type SongView } from '@/config/routes';
import EmptyState from '@/shared/ui/EmptyState';
import SongActions from '@/features/songs/components/SongActions';
import SongHeader from '@/shared/viewer/SongHeader';
import SongTabs from '@/features/songs/components/SongTabs';
import { SONG_FORMAT_LIST } from '@/features/songs/formats';
import { useViewerSettings } from '@/shared/viewer/useViewerSettings';

interface SongWorkspaceProps {
    song: Song;
    initialView: SongView;
}

export default function SongWorkspace({ song, initialView }: SongWorkspaceProps) {
    const [view, setView] = useState<SongView>(initialView);
    const settings = useViewerSettings(); // compartido por todas las vistas
    const input = useMemo(() => toSongInput(song), [song]);

    const available = Object.fromEntries(
        SONG_FORMAT_LIST.map((format) => [format.id, format.hasContent(song)]),
    ) as Record<SongView, boolean>;

    function selectView(next: SongView) {
        setView(next);
        // Refleja la pestaña en la URL sin navegar ni recargar datos
        const url = new URL(window.location.href);
        if (next === 'cifrado') url.searchParams.delete('view');
        else url.searchParams.set('view', next);
        window.history.replaceState(null, '', `${url.pathname}${url.search}`);
    }

    return (
        <>
            <SongHeader
                title={input.title}
                meta={input}
                actions={<SongActions id={song.id} title={input.title} view={view} />}
            />
            <SongTabs view={view} onChange={selectView} available={available} />

            {/* Todos los paneles quedan montados: al cambiar de pestaña se conserva
                la disposición, el modo y la sección resaltada de cada uno. */}
            {SONG_FORMAT_LIST.map((format) => (
                <div key={format.id} hidden={view !== format.id}>
                    {format.hasContent(song) ? (
                        <format.Viewer song={song} input={input} settings={settings} />
                    ) : (
                        format.empty && (
                            <EmptyState
                                title={format.empty.title}
                                description={format.empty.description}
                                href={songEditPath(song.id, format.id)}
                                cta={format.empty.cta}
                            />
                        )
                    )}
                </div>
            ))}
        </>
    );
}