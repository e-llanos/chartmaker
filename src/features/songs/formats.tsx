'use client';

import type { ComponentType } from 'react';
import { SONG_VIEWS, type SongView } from '@/config/routes';
import type { Chart } from '@/domain/chart/types';
import { emptyChart } from '@/domain/chart/utils';
import { toSongInput } from '@/domain/song/constants';
import type { Song, SongInput } from '@/domain/song/types';
import ChartEditor from '@/features/chart/components/ChartEditor';
import ChartViewer from '@/features/chart/components/ChartViewer';
import ChordSheetEditor, { type ChordSheetData } from '@/features/chordsheet/components/ChordSheetEditor';
import ChordSheetViewer from '@/features/chordsheet/components/ChordSheetViewer';
import type { ViewerSettings } from '@/shared/viewer/useViewerSettings';

/** Lo que recibe el visor de cualquier formato. */
export interface FormatViewerProps {
    song: Song;
    /** Los datos editables de la canción (título, tonalidad, letra…). */
    input: SongInput;
    /** Ajustes compartidos entre todas las pestañas. */
    settings: ViewerSettings;
}

/** Lo que recibe el editor de cualquier formato. */
export interface FormatEditorProps<T> {
    song: Song;
    input: SongInput;
    initial: T;
    onChange: (value: T) => void;
}

interface FormatEditor<T> {
    /** Encabezado de la página de edición. */
    title: (input: SongInput) => string;
    /** Valor con el que arranca el editor. */
    initial: (song: Song) => T;
    /** Cuerpo de la petición de guardado; por defecto, el propio valor. */
    toPayload?: (value: T) => unknown;
    /** Condición adicional para poder guardar. */
    canSave?: (value: T) => boolean;
    Editor: ComponentType<FormatEditorProps<T>>;
}

export interface SongFormat<T = unknown> {
    id: SongView;
    /** Texto de la pestaña. */
    label: string;
    /** Texto accesible del botón de editar. */
    editLabel: string;
    /** ¿La canción tiene contenido en este formato? (el principal siempre lo tiene). */
    hasContent: (song: Song) => boolean;
    /** Se muestra en lugar del visor mientras no hay contenido. */
    empty?: { title: string; description: string; cta: string };
    Viewer: ComponentType<FormatViewerProps>;
    editor: FormatEditor<T>;
}

/** Fija el tipo del contenido de cada formato y lo deja listo para el registro. */
const define = <T,>(format: SongFormat<T>): SongFormat => format as unknown as SongFormat;

/* ---------- Cifrado ---------- */

function ChordSheetFormatViewer({ song, input, settings }: FormatViewerProps) {
    return (
        <ChordSheetViewer
            chordProText={input.body}
            originalKey={input.key}
            title={input.title}
            meta={input}
            chart={song.chart}
            settings={settings}
            hideHeader
        />
    );
}

function ChordSheetFormatEditor({ initial, onChange }: FormatEditorProps<ChordSheetData>) {
    return <ChordSheetEditor initial={initial} onChange={onChange} />;
}

/* ---------- Chart (simple o avanzado) ---------- */

function ChartFormatViewer({ song, input, settings }: FormatViewerProps) {
    return song.chart ? (
        <ChartViewer song={input} chart={song.chart} settings={settings} hideHeader />
    ) : null;
}

function ChartFormatEditor({ input, initial, onChange }: FormatEditorProps<Chart>) {
    return <ChartEditor song={input} initial={initial} onChange={onChange} />;
}

const untitled = (input: SongInput): string => input.title || 'Sin título';

/** Registro de formatos: pestañas, visores, editores y rutas salen de aquí. */
export const SONG_FORMATS: Record<SongView, SongFormat> = {
    cifrado: define<ChordSheetData>({
        id: 'cifrado',
        label: 'Cifrado',
        editLabel: 'Editar cifrado',
        hasContent: () => true,
        Viewer: ChordSheetFormatViewer,
        editor: {
            title: () => 'Editor de cifrado',
            initial: toSongInput,
            canSave: (value) => value.title.trim() !== '',
            Editor: ChordSheetFormatEditor,
        },
    }),
    chart: define<Chart>({
        id: 'chart',
        label: 'Chart',
        editLabel: 'Editar chart',
        hasContent: (song) => Boolean(song.chart?.sections.length),
        empty: {
            title: 'Aún no hay chart',
            description:
                'Un chart muestra la canción por compases, en estilo simple o avanzado. Puedes generarlo a partir del cifrado y ajustarlo.',
            cta: 'Crear chart',
        },
        Viewer: ChartFormatViewer,
        editor: {
            title: (input) => `Editor de chart · ${untitled(input)}`,
            initial: (song) => song.chart ?? emptyChart('simple'),
            toPayload: (chart) => ({ chart }),
            Editor: ChartFormatEditor,
        },
    }),
};

/** Los formatos en el orden de las pestañas. */
export const SONG_FORMAT_LIST: SongFormat[] = SONG_VIEWS.map((view) => SONG_FORMATS[view]);