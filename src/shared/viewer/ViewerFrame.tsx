'use client';

import { useRef, type ReactNode } from 'react';
import type { ViewMode } from '@/domain/chordsheet/view-mode';
import { semitoneDistance } from '@/domain/music/engine';
import type { Badge } from '@/domain/sections/section-types';
import type { SongCreate } from '@/domain/song/types';
import ExportHead from '@/shared/export/ExportHead';
import ExportMenu from '@/shared/export/ExportMenu';
import SectionNav from './SectionNav';
import type { ViewerSettings } from './useViewerSettings';
import ViewerToolbar, { type SectionsLayout } from './ViewerToolbar';

interface ViewerFrameProps {
    /** Cabecera de la canción. Se omite cuando la dibuja el contenedor. */
    header?: ReactNode;
    title: string;
    /** Oculta el título de la barra cuando la cabecera ya lo muestra. */
    hideTitle?: boolean;
    /** Datos de la canción: habilitan el menú de descarga y la cabecera exportable. */
    song: SongCreate | null;
    settings: ViewerSettings;
    originalKey: string;
    displayKey: string;
    badges: Badge[];
    /** Prefijo de los ids de sección para la navegación por insignias. */
    navScope: string;
    layout?: SectionsLayout;
    onLayoutChange?: (layout: SectionsLayout) => void;
    mode?: ViewMode;
    onModeChange?: (mode: ViewMode) => void;
    isEmpty: boolean;
    emptyMessage: string;
    /** Contenido de la hoja (las secciones). */
    children: ReactNode;
}

/**
 * Marco común de los visores: cabecera opcional, barra de herramientas,
 * navegación por insignias y la hoja que se captura al exportar.
 */
export default function ViewerFrame({
    header, title, hideTitle = false, song, settings, originalKey, displayKey, badges, navScope,
    layout, onLayoutChange, mode, onModeChange, isEmpty, emptyMessage, children,
}: ViewerFrameProps) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const { setSemitones, notation, setNotation } = settings;

    return (
        <div className="viewer">
            {header}
            <ViewerToolbar
                title={title}
                hideTitle={hideTitle}
                currentKey={displayKey}
                notation={notation}
                layout={layout}
                onLayoutChange={onLayoutChange}
                mode={mode}
                onModeChange={onModeChange}
                onTranspose={(d: number) => setSemitones((s) => s + d)}
                onKeyChange={(k: string) => setSemitones(semitoneDistance(originalKey, k))}
                onNotationChange={setNotation}
                actions={song ? <ExportMenu sheetRef={sheetRef} song={song} /> : null}
            />
            <SectionNav badges={badges} scopeId={navScope} />

            {/* La hoja es lo que se captura al exportar a PDF o PNG */}
            <div ref={sheetRef} className="viewer-sheet">
                {song && <ExportHead song={song} displayKey={displayKey} notation={notation} />}
                {isEmpty ? <p className="empty-state">{emptyMessage}</p> : children}
            </div>
        </div>
    );
}
