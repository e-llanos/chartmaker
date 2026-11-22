'use client';

import { useMemo, useState } from 'react';
import type { Chart } from '@/domain/chart/types';
import { parseSections } from '@/domain/chordsheet/parse-sections';
import type { ViewMode } from '@/domain/chordsheet/view-mode';
import { computeBadges, SECTION_TYPES } from '@/domain/sections/section-types';
import type { SongCreate } from '@/domain/song/types';
import SectionCard from '@/shared/viewer/SectionCard';
import SongHeader, { type SongMeta } from '@/shared/viewer/SongHeader';
import { useChordMapper, useResolvedSettings } from '@/shared/viewer/useChordMapper';
import type { ViewerSettings } from '@/shared/viewer/useViewerSettings';
import ViewerFrame from '@/shared/viewer/ViewerFrame';
import type { SectionsLayout } from '@/shared/viewer/ViewerToolbar';
import { exportMetaItems } from '@/shared/export/export-meta';
import { buildPdfSong, type PdfSong } from '@/shared/export/pdf/pdf-song';
import { songPdfExport } from '@/shared/export/pdf/pdf-export';
import ChordLine from './ChordLine';

interface ChordSheetViewerProps {
    chordProText: string;
    originalKey: string;
    title: string;
    meta?: SongMeta;
    chart?: Chart;
    /** Ajustes compartidos entre pestañas; si se omite, el visor usa los suyos. */
    settings?: ViewerSettings;
    /** La cabecera la dibuja el contenedor de la canción. */
    hideHeader?: boolean;
}

export default function ChordSheetViewer({
    chordProText, originalKey, title, meta, chart, settings: sharedSettings, hideHeader = false,
}: ChordSheetViewerProps) {
    const settings = useResolvedSettings(sharedSettings);
    const { displayKey, mapChord } = useChordMapper(originalKey, settings);

    const [layout, setLayout] = useState<SectionsLayout>('columns');
    const [mode, setMode] = useState<ViewMode>('full');
    const [highlighted, setHighlighted] = useState<string | null>(null);

    const sections = useMemo(() => parseSections(chordProText), [chordProText]);
    const badges = useMemo(() => computeBadges(sections), [sections]);

    const song = useMemo<SongCreate | null>(
        () => (meta ? {
            title, key: originalKey, body: chordProText, ...meta,
            ...(chart ? { chart } : {}),
        } : null),
        [meta, title, originalKey, chordProText, chart]
    );

    const pdfSong = useMemo<PdfSong | null>(
        () => song ? buildPdfSong({
            title: song.title,
            artist: song.artist,
            meta: exportMetaItems(song, displayKey, settings.notation, settings.reference),
            mode, layout, sections, badges, mapChord,
        }) : null,
        [song, displayKey, settings.notation, settings.reference, mode, layout, sections, badges, mapChord]
    );

    const pdfExport = useMemo(() => (pdfSong ? songPdfExport(pdfSong) : null), [pdfSong]);

    return (
        <ViewerFrame
            header={meta && !hideHeader ? <SongHeader title={title} meta={meta} /> : null}
            title={title}
            hideTitle={Boolean(meta)}
            song={song}
            settings={settings}
            originalKey={originalKey}
            displayKey={displayKey}
            badges={badges}
            navScope="cif"
            layout={layout}
            onLayoutChange={setLayout}
            mode={mode}
            onModeChange={setMode}
            isEmpty={sections.length === 0}
            emptyMessage="Agrega una sección para ver el cifrado aquí."
            pdf={pdfExport}
        >
            <div className={`sections-layout sections-layout-${layout}`}>
                {sections.map((s, i) => (
                    <SectionCard
                        key={s.id}
                        domId={`cif-${s.id}`}
                        badge={badges[i]}
                        label={s.label || SECTION_TYPES[s.type].label}
                        note={s.note}
                        repeat={s.repeat}
                        highlighted={highlighted === s.id}
                        onToggleHighlight={() => setHighlighted((h) => (h === s.id ? null : s.id))}
                    >
                        {s.lines.map((l, j) =>
                            'comment' in l ? (
                                <p key={j} className="line-comment">{l.comment}</p>
                            ) : (
                                <ChordLine key={j} tokens={l.tokens} mapChord={mapChord} mode={mode} />
                            )
                        )}
                    </SectionCard>
                ))}
            </div>
        </ViewerFrame>
    );
}
