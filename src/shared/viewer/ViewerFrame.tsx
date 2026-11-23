'use client';

import { useCallback, useContext, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { ViewMode } from '@/domain/chordsheet/view-mode';
import { semitoneDistance } from '@/domain/music/notation/engine';
import type { Badge } from '@/domain/sections/section-types';
import type { SongCreate } from '@/domain/song/types';
import ExportHead from '@/shared/export/ExportHead';
import ExportList from '@/shared/export/ExportList';
import PdfExportDialog from '@/shared/export/pdf/PdfExportDialog';
import { PdfExportContext, type ExportFormat } from '@/shared/export/pdf/PdfExportContext';
import type { PdfExport } from '@/shared/export/pdf/pdf-export';
import SectionNav from './SectionNav';
import { ToolbarSlotContext } from './ToolbarSlot';
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
    /** Controles propios del visor (por ejemplo, el estilo del chart). */
    controls?: ReactNode;
    isEmpty: boolean;
    emptyMessage: string;
    /** Contenido de la hoja (las secciones). */
    children: ReactNode;
    pdf?: PdfExport | null;
}

/**
 * Marco común de los visores: cabecera opcional, barra de herramientas,
 * navegación por insignias y la hoja que se captura al exportar.
 */
export default function ViewerFrame({
    header, title, hideTitle = false, song, settings, originalKey, displayKey, badges, navScope,
    layout, onLayoutChange, mode, onModeChange, isEmpty, emptyMessage, children, controls, pdf
}: ViewerFrameProps) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const toolbarSlot = useContext(ToolbarSlotContext);
    const { setSemitones, notation, setNotation, reference, setReference, fontPercent, setFontPercent } = settings;
    const [exportOpen, setExportOpen] = useState(false);
    const openExport = useCallback(() => setExportOpen(true), []);

    const toolbar = (
        <ViewerToolbar
            title={title}
            hideTitle={hideTitle}
            currentKey={displayKey}
            originalKey={originalKey}
            notation={notation}
            layout={layout}
            onLayoutChange={onLayoutChange}
            mode={mode}
            onModeChange={onModeChange}
            onKeyChange={(k: string) => setSemitones(semitoneDistance(originalKey, k))}
            onNotationChange={setNotation}
            reference={reference}
            onReferenceChange={setReference}
            fontPercent={fontPercent}
            onFontChange={setFontPercent}
            controls={controls}
            actions={song ? <ExportList sheetRef={sheetRef} song={song} /> : null}
        />
    );

    return (
        <PdfExportContext.Provider value={openExport}>
            <div className="viewer">
                {header}
                {/* Dentro de la cabecera de la canción (portal) o, sin ella, en línea sobre la hoja.
                `null` = pestaña inactiva o cabecera todavía sin montar: no se dibuja. */}
                {toolbarSlot === undefined ? toolbar : toolbarSlot && createPortal(toolbar, toolbarSlot)}
                <SectionNav badges={badges} scopeId={navScope} />

                {/* La hoja es lo que se captura al exportar a PDF o PNG */}
                <div
                    ref={sheetRef}
                    className="viewer-sheet"
                    style={{ '--viewer-scale': fontPercent / 100 } as CSSProperties}
                >
                    {song && <ExportHead song={song} displayKey={displayKey} notation={notation} reference={reference} />}
                    {isEmpty ? <p className="empty-state">{emptyMessage}</p> : children}
                </div>
                {pdf && (
                    <PdfExportDialog pdf={pdf} open={exportOpen} onClose={() => setExportOpen(false)} />
                )}
            </div>
        </PdfExportContext.Provider>
    );
}