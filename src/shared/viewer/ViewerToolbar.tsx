'use client';

import type { ReactNode, SVGProps } from 'react';
import { VIEW_MODE_LABELS, type ViewMode } from '@/domain/chordsheet/view-mode';
import { SONG_KEYS } from '@/domain/music/core/key';
import { NOTATION_LABELS, formatKeyLabel, type Notation } from '@/domain/music/engine';

export type SectionsLayout = 'columns' | 'list';

interface ViewerToolbarProps {
  title: string;
  currentKey: string;
  notation: Notation;
  onTranspose: (delta: number) => void;
  onKeyChange: (key: string) => void;
  onNotationChange: (notation: Notation) => void;
  /** Oculta el título cuando la cabecera de la canción ya lo muestra. */
  hideTitle?: boolean;
  /** Disposición de las secciones (si se omite, no se muestra el botón). */
  layout?: SectionsLayout;
  onLayoutChange?: (layout: SectionsLayout) => void;
  /** Contenido del cifrado: letra + acordes, solo acordes, solo letra (solo en cifrados). */
  mode?: ViewMode;
  onModeChange?: (mode: ViewMode) => void;
  /** Controles extra al final de la barra (menú de descarga). */
  actions?: ReactNode;
}

const iconProps: SVGProps<SVGSVGElement> = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

function ListIcon() {
  return (
    <svg {...iconProps}>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function ColumnsIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="4" width="5" height="16" rx="1" />
      <rect x="10" y="4" width="5" height="16" rx="1" />
      <rect x="17" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

/** Barra superior del visualizador: tonalidad, notación, contenido, disposición y descarga. */
export default function ViewerToolbar({
  title, currentKey, notation, onTranspose, onKeyChange, onNotationChange,
  hideTitle = false, layout, onLayoutChange, mode, onModeChange, actions,
}: ViewerToolbarProps) {
  const keys = SONG_KEYS.includes(currentKey) ? SONG_KEYS : [currentKey, ...SONG_KEYS];
  const notationEntries = Object.entries(NOTATION_LABELS) as [Notation, string][];
  const modeEntries = Object.entries(VIEW_MODE_LABELS) as [ViewMode, string][];

  const next: SectionsLayout = layout === 'columns' ? 'list' : 'columns';
  const layoutLabel = next === 'list' ? 'Ver secciones en lista' : 'Ver secciones en columnas';
  const showLayout = layout !== undefined && onLayoutChange !== undefined;

  return (
    <header className="viewer-toolbar">
      {!hideTitle && <h2 className="viewer-title">{title || 'Sin título'}</h2>}

      <div className="viewer-controls">
        {/* Transposición: − tono + */}
        <div className="control-group control-transpose" role="group" aria-label="Transposición">
          <button type="button" onClick={() => onTranspose(-1)} aria-label="Bajar un semitono">−</button>
          <select value={currentKey} onChange={(e) => onKeyChange(e.target.value)} aria-label="Tonalidad">
            {keys.map((k) => (
              <option key={k} value={k}>{formatKeyLabel(k, notation)}</option>
            ))}
          </select>
          <button type="button" onClick={() => onTranspose(1)} aria-label="Subir un semitono">+</button>
        </div>

        {/* Cómo se muestra el cifrado */}
        <div className="control-group">
          <select
            value={notation}
            onChange={(e) => onNotationChange(e.target.value as Notation)}
            aria-label="Notación"
          >
            {notationEntries.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          {mode !== undefined && onModeChange && (
            <select
              value={mode}
              onChange={(e) => onModeChange(e.target.value as ViewMode)}
              aria-label="Contenido"
            >
              {modeEntries.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          )}
        </div>

        {/* Acciones: disposición y descarga */}
        {(showLayout || actions) && (
          <div className="control-group">
            {showLayout && (
              <button
                type="button"
                className="layout-toggle"
                onClick={() => onLayoutChange(next)}
                aria-label={layoutLabel}
                title={layoutLabel}
              >
                {next === 'list' ? <ListIcon /> : <ColumnsIcon />}
              </button>
            )}
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}