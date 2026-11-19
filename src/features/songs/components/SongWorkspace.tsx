'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { toSongInput } from '@/domain/song/constants';
import type { Song } from '@/domain/song/types';
import { songEditPath, type SongView } from '@/config/routes';
import DeleteSongButton from '@/features/songs/components/DeleteSongButton';
import EditSongLink from '@/features/songs/components/EditSongLink';
import { SONG_BAR_SLOT_ID } from '@/features/songs/components/SongsBreadcrumbs';
import SongTabs from '@/features/songs/components/SongTabs';
import { SONG_FORMAT_LIST } from '@/features/songs/formats';
import EmptyState from '@/shared/ui/EmptyState';
import SongHeader from '@/shared/viewer/SongHeader';
import { SongMenuContext, type SongMenu } from '@/shared/viewer/SongMenuContext';
import { ToolbarSlotContext } from '@/shared/viewer/ToolbarSlot';
import { useViewerSettings } from '@/shared/viewer/useViewerSettings';

interface SongWorkspaceProps {
    song: Song;
    initialView: SongView;
    canEdit: boolean;
    canDelete: boolean;
}

/**
 * Dónde va la barra de opciones:
 *  - undefined: servidor / hidratación (todavía no se sabe; no se dibuja)
 *  - elemento: el hueco de la fila del botón de la biblioteca (se dibuja allí con un portal)
 *  - null: no hay fila de migas; la barra va en la cabecera
 */
const noopSubscribe = () => () => { };
const getBarHost = (): HTMLElement | null => document.getElementById(SONG_BAR_SLOT_ID);
const getServerBarHost = (): undefined => undefined;

export default function SongWorkspace({ song, initialView, canEdit, canDelete }: SongWorkspaceProps) {
    const [view, setView] = useState<SongView>(initialView);
    const [toolbarSlot, setToolbarSlot] = useState<HTMLElement | null>(null);
    const settings = useViewerSettings(); // compartido por todas las vistas
    const input = useMemo(() => toSongInput(song), [song]);
    const barHost = useSyncExternalStore<HTMLElement | null | undefined>(
        noopSubscribe,
        getBarHost,
        getServerBarHost,
    );

    // Editar y Eliminar aparecen dentro de las preferencias de cada visor
    const menu = useMemo<SongMenu>(
        () => ({
            edit: canEdit ? <EditSongLink id={song.id} view={view} variant="row" /> : null,
            remove: canDelete ? <DeleteSongButton id={song.id} title={input.title} /> : null,
        }),
        [canEdit, canDelete, song.id, view, input.title],
    );

    const available = Object.fromEntries(
        SONG_FORMAT_LIST.map((format) => [format.id, format.hasContent(song)]),
    ) as Record<SongView, boolean>;

    function selectView(next: SongView) {
        setView(next);
        // Refleja la vista en la URL sin navegar ni recargar datos
        const url = new URL(window.location.href);
        if (next === 'cifrado') url.searchParams.delete('view');
        else url.searchParams.set('view', next);
        window.history.replaceState(null, '', `${url.pathname}${url.search}`);
    }

    // Barra de opciones: selector de vista | tonalidad y preferencias | editar
    const bar = (
        <div className="song-bar">
            <SongTabs view={view} onChange={selectView} available={available} />
            <span className="song-bar-sep" aria-hidden="true" />
            {/* Aquí se dibuja la barra del visor activo (tonalidad y preferencias) */}
            <div ref={setToolbarSlot} className="song-toolbar-slot" />
            {canEdit && (
                <>
                    <span className="song-bar-sep" aria-hidden="true" />
                    <EditSongLink id={song.id} view={view} />
                </>
            )}
        </div>
    );

    return (
        <>
            <SongHeader title={input.title} meta={input} actions={barHost === null ? bar : null} />
            {barHost && createPortal(bar, barHost)}

            {/* Todos los paneles quedan montados: al cambiar de vista se conserva
                la disposición, el modo y la sección resaltada de cada uno. */}
            <SongMenuContext.Provider value={menu}>
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
            </SongMenuContext.Provider>
        </>
    );
}