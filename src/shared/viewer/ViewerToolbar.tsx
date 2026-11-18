'use client';

import { useEffect, useRef, type ReactNode, type SVGProps } from 'react';
import { LuSlidersHorizontal } from 'react-icons/lu';
import { VIEW_MODE_LABELS, type ViewMode } from '@/domain/chordsheet/view-mode';
import type { KeyReference } from '@/domain/music/core/analysis';
import { SONG_KEYS, parseKey, relativeKey } from '@/domain/music/core/key';
import { NOTATION_LABELS, formatKeyLabel, type Notation } from '@/domain/music/notation/engine';
import { FONT_DEFAULT, FONT_MAX, FONT_MIN, FONT_STEP } from './useViewerSettings';

export type SectionsLayout = 'columns' | 'list';

interface ViewerToolbarProps {
  title: string;
  currentKey: string;
  notation: Notation;
  onTranspose: (delta: number) => void;
  onKeyChange: (key: string) => void;
  onNotationChange: (notation: Notation) => void;
  /** Desde dónde se numeran los acordes; el selector solo aparece en Nashville y romanos con tonalidad menor. */
  reference?: KeyReference;
  onReferenceChange?: (reference: KeyReference) => void;
  /** Tamaño del texto en porcentaje (si se omite, no se muestran los botones). */
  fontPercent?: number;
  onFontChange?: (percent: number) => void;
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
  /** Controles propios del visor (por ejemplo, el estilo del chart); van en el menú de ajustes. */
  controls?: ReactNode;
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

/** Ajustes de vista agrupados en un solo botón. Se cierra al pulsar fuera o con Escape. */
function ViewMenu({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = () => {
      if (ref.current?.open) ref.current.open = false;
    };
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <details ref={ref} className="menu view-menu">
      <summary aria-label="Ajustes de vista" title="Ajustes de vista">
        <LuSlidersHorizontal size={16} aria-hidden="true" />
      </summary>
      <div className="menu-list menu-panel">{children}</div>
    </details>
  );
}

/** Barra del visualizador: tonalidad, tamaño del texto, disposición, ajustes de vista y descarga. */
export default function ViewerToolbar({
  title, currentKey, notation, onTranspose, onKeyChange, onNotationChange, reference, onReferenceChange,
  fontPercent, onFontChange, hideTitle = false, layout, onLayoutChange, mode, onModeChange, actions, controls,
}: ViewerToolbarProps) {
  const keys = SONG_KEYS.includes(currentKey) ? SONG_KEYS : [currentKey, ...SONG_KEYS];
  const notationEntries = Object.entries(NOTATION_LABELS) as [Notation, string][];
  const modeEntries = Object.entries(VIEW_MODE_LABELS) as [ViewMode, string][];

  // La numeración solo depende de la referencia en tonalidades menores (Em: i desde la tónica, vi desde G).
  const parsedKey = parseKey(currentKey);
  const relative = parsedKey?.mode === 'minor' ? relativeKey(parsedKey) : null;
  const showReference =
    (notation === 'nashville' || notation === 'roman') && relative !== null && reference !== undefined && onReferenceChange !== undefined;

  const next: SectionsLayout = layout === 'columns' ? 'list' : 'columns';
  const layoutLabel = next === 'list' ? 'Ver secciones en lista' : 'Ver secciones en columnas';
  const showLayout = layout !== undefined && onLayoutChange !== undefined;
  const showFont = fontPercent !== undefined && onFontChange !== undefined;

  return (
    <div className="viewer-toolbar" role="toolbar" aria-label="Controles de la canción">
      {!hideTitle && <h2 className="viewer-title">{title || 'Sin título'}</h2>}

      <div className="viewer-controls">
        {/* Transposición: − tono + */}
        <div className="control-group control-joined" role="group" aria-label="Transposición">
          <button type="button" onClick={() => onTranspose(-1)} aria-label="Bajar un semitono">−</button>
          <select value={currentKey} onChange={(e) => onKeyChange(e.target.value)} aria-label="Tonalidad">
            {keys.map((k) => (
              <option key={k} value={k}>{formatKeyLabel(k, notation)}</option>
            ))}
          </select>
          <button type="button" onClick={() => onTranspose(1)} aria-label="Subir un semitono">+</button>
        </div>

        {/* Tamaño del texto: A− 100 % A+ (el del centro restablece) */}
        {showFont && (
          <div className="control-group control-joined" role="group" aria-label="Tamaño del texto">
            <button
              type="button"
              onClick={() => onFontChange(fontPercent - FONT_STEP)}
              disabled={fontPercent <= FONT_MIN}
              aria-label="Reducir el texto"
              title="Reducir el texto"
            >
              <span className="font-glyph font-glyph-sm" aria-hidden="true">A</span>
            </button>
            <button
              type="button"
              className="font-value"
              onClick={() => onFontChange(FONT_DEFAULT)}
              disabled={fontPercent === FONT_DEFAULT}
              aria-label="Restablecer el tamaño del texto"
              title="Restablecer el tamaño del texto"
            >
              {fontPercent}%
            </button>
            <button
              type="button"
              onClick={() => onFontChange(fontPercent + FONT_STEP)}
              disabled={fontPercent >= FONT_MAX}
              aria-label="Aumentar el texto"
              title="Aumentar el texto"
            >
              <span className="font-glyph font-glyph-lg" aria-hidden="true">A</span>
            </button>
          </div>
        )}

        {/* Disposición de las secciones */}
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

        {/* Cómo se muestra el cifrado */}
        <ViewMenu>
          <label className="menu-field">
            <span>Notación</span>
            <select value={notation} onChange={(e) => onNotationChange(e.target.value as Notation)}>
              {notationEntries.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
          {showReference && relative && (
            <label className="menu-field">
              <span>Numerar desde</span>
              <select
                value={reference}
                onChange={(e) => onReferenceChange(e.target.value as KeyReference)}
                title="Desde qué tonalidad se numeran los acordes"
              >
                <option value="tonic">Desde la tónica ({formatKeyLabel(currentKey, 'symbol')})</option>
                <option value="relativeMajor">Desde la relativa ({formatKeyLabel(relative.tonic, 'symbol')})</option>
              </select>
            </label>
          )}
          {mode !== undefined && onModeChange && (
            <label className="menu-field">
              <span>Contenido</span>
              <select value={mode} onChange={(e) => onModeChange(e.target.value as ViewMode)}>
                {modeEntries.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </label>
          )}
          {controls && (
            <div className="menu-field">
              <span>Estilo</span>
              {controls}
            </div>
          )}
        </ViewMenu>

        {/* Descarga */}
        {actions}
      </div>
    </div>
  );
}