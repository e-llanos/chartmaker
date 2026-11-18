'use client';

import { useRef, type ReactNode } from 'react';
import { LuSlidersHorizontal } from 'react-icons/lu';
import type { ViewMode } from '@/domain/chordsheet/view-mode';
import type { KeyReference } from '@/domain/music/core/analysis';
import type { Notation } from '@/domain/music/notation/engine';
import KeyPicker from './KeyPicker';
import SettingsDialog from './SettingsDialog';

export type SectionsLayout = 'columns' | 'list';

interface ViewerToolbarProps {
  title: string;
  /** Tonalidad que se muestra (ya transpuesta) y la original de la canción. */
  currentKey: string;
  originalKey: string;
  notation: Notation;
  onKeyChange: (key: string) => void;
  onNotationChange: (notation: Notation) => void;
  /** Desde dónde se numeran los acordes; solo aparece en Nashville y romanos con tonalidad menor. */
  reference?: KeyReference;
  onReferenceChange?: (reference: KeyReference) => void;
  /** Tamaño del texto en porcentaje (si se omite, no se muestra en las preferencias). */
  fontPercent?: number;
  onFontChange?: (percent: number) => void;
  /** Oculta el título cuando la cabecera de la canción ya lo muestra. */
  hideTitle?: boolean;
  /** Disposición de las secciones (si se omite, no se muestra la opción). */
  layout?: SectionsLayout;
  onLayoutChange?: (layout: SectionsLayout) => void;
  /** Contenido del cifrado: letra + acordes, solo acordes, solo letra (solo en cifrados). */
  mode?: ViewMode;
  onModeChange?: (mode: ViewMode) => void;
  /** Exportar: va dentro de la ventana de preferencias. */
  actions?: ReactNode;
  /** Controles propios del visor (por ejemplo, el estilo del chart): también dentro de la ventana. */
  controls?: ReactNode;
}

/** Barra del visualizador: tonalidad y preferencias. El resto de opciones vive en la ventana de preferencias. */
export default function ViewerToolbar({
  title, currentKey, originalKey, notation, onKeyChange, onNotationChange, reference, onReferenceChange,
  fontPercent, onFontChange, hideTitle = false, layout, onLayoutChange, mode, onModeChange, actions, controls,
}: ViewerToolbarProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <div className="viewer-toolbar" role="toolbar" aria-label="Controles de la canción">
        {!hideTitle && <h2 className="viewer-title">{title || 'Sin título'}</h2>}

        <div className="viewer-controls">
          <KeyPicker
            currentKey={currentKey}
            originalKey={originalKey}
            notation={notation}
            onKeyChange={onKeyChange}
          />
          <button
            type="button"
            aria-label="Preferencias"
            title="Preferencias"
            aria-haspopup="dialog"
            onClick={() => dialogRef.current?.showModal()}
          >
            <LuSlidersHorizontal size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <SettingsDialog
        dialogRef={dialogRef}
        currentKey={currentKey}
        notation={notation}
        onNotationChange={onNotationChange}
        reference={reference}
        onReferenceChange={onReferenceChange}
        fontPercent={fontPercent}
        onFontChange={onFontChange}
        layout={layout}
        onLayoutChange={onLayoutChange}
        mode={mode}
        onModeChange={onModeChange}
        controls={controls}
        actions={actions}
      />
    </>
  );
}