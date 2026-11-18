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
import { ToolbarSlotContext } from '@/shared/viewer/ToolbarSlot';
import { useViewerSettings } from '@/shared/viewer/useViewerSettings';

interface SongWorkspaceProps {
    song: Song;
    initialView: SongView;
    canEdit: boolean;
    canDelete: boolean;
}

export default function SongWorkspace({ song, initialView, canEdit, canDelete }: SongWorkspaceProps) {
    const [view, setView] = useState<SongView>(initialView);
    const settings = useViewerSettings(); // compartido por todas las vistas
    const input = useMemo(() => toSongInput(song), [song]);
    // Hueco de la cabecera donde la pestaña activa dibuja su barra de controles.
    const [toolbarSlot, setToolbarSlot] = useState<HTMLElement | null>(null);

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
                actions={
                    <>
                        <div ref={setToolbarSlot} className="song-toolbar-slot" />
                        {canEdit || canDelete ? (
                            <SongActions id={song.id} title={input.title} view={view} canEdit={canEdit} canDelete={canDelete} />
                        ) : null}
                    </>
                }
            />
            <SongTabs view={view} onChange={selectView} available={available} />

            {/* Todos los paneles quedan montados: al cambiar de pestaña se conserva
                la disposición, el modo y la sección resaltada de cada uno. Solo el panel
                activo dibuja su barra de controles en la cabecera. */}
            {SONG_FORMAT_LIST.map((format) => (
                <ToolbarSlotContext.Provider key={format.id} value={view === format.id ? toolbarSlot : null}>
                    <div hidden={view !== format.id}>
                        {format.hasContent(song) ? (
                            <format.Viewer song={song} input={input} settings={settings} />
                        ) : (
                            format.empty && (
                                <EmptyState
                                    title={format.empty.title}
                                    description={format.empty.description}
                                    href={canEdit ? songEditPath(song.id, format.id) : undefined}
                                    cta={canEdit ? format.empty.cta : undefined}
                                />
                            )
                        )}
                    </div>
                </ToolbarSlotContext.Provider>
            ))}
        </>
    );
}