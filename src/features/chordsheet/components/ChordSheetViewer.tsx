'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { parseSections } from '@/domain/chordsheet/parse-sections';
import type { ViewMode } from '@/domain/chordsheet/view-mode';
import { computeBadges, SECTION_TYPES } from '@/domain/sections/section-types';
import type { SongCreate } from '@/domain/song/types';
import type { Chart } from '@/domain/chart/types';
import type { Score } from '@/domain/score/types';
import {
    transposeChordString,
    convertChordString,
    semitoneDistance,
} from '@/domain/music/engine';
import ViewerToolbar, { type SectionsLayout } from '@/shared/viewer/ViewerToolbar';
import SectionNav from '@/shared/viewer/SectionNav';
import SectionCard from '@/shared/viewer/SectionCard';
import SongHeader, { type SongMeta } from '@/shared/viewer/SongHeader';
import ExportMenu from '@/shared/export/ExportMenu';
import ExportHead from '@/shared/export/ExportHead';
import { useViewerSettings, type ViewerSettings } from '@/shared/viewer/useViewerSettings';
import ChordLine from '@/features/chordsheet/components/ChordLine';

interface ChordSheetViewerProps {
    chordProText: string;
    originalKey: string;
    title: string;
    meta?: SongMeta;
    editHref?: string;
    deleteId?: string;
    chart?: Chart;
    score?: Score;
    settings?: ViewerSettings;
    hideHeader?: boolean;
}

export default function ChordSheetViewer({
    chordProText, originalKey, title, meta, chart, score, settings, hideHeader = false,
}: ChordSheetViewerProps) {
    const local = useViewerSettings();
    const { semitones, setSemitones, notation, setNotation } = settings ?? local;

    const [layout, setLayout] = useState<SectionsLayout>('columns');
    const [mode, setMode] = useState<ViewMode>('full');
    const [highlighted, setHighlighted] = useState<string | null>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const sections = useMemo(() => parseSections(chordProText), [chordProText]);
    const badges = useMemo(() => computeBadges(sections), [sections]);
    const displayKey = transposeChordString(originalKey, semitones, 'symbol', originalKey);

    const song = useMemo<SongCreate | null>(
        () => (meta ? {
            title, key: originalKey, body: chordProText, ...meta,
            ...(chart ? { chart } : {}),
            ...(score ? { score } : {}),
        } : null),
        [meta, title, originalKey, chordProText, chart, score]
    );

    const mapChord = useCallback(
        (chord: string): string =>
            convertChordString(
                transposeChordString(chord, semitones, 'symbol', originalKey),
                notation,
                displayKey
            ),
        [semitones, notation, originalKey, displayKey]
    );

    return (
        <div className="viewer">
            {meta && !hideHeader && <SongHeader title={title} meta={meta} />}
            <ViewerToolbar
                title={title}
                hideTitle={Boolean(meta)}
                currentKey={displayKey}
                notation={notation}
                layout={layout}
                mode={mode}
                onTranspose={(d: number) => setSemitones((s) => s + d)}
                onKeyChange={(k: string) => setSemitones(semitoneDistance(originalKey, k))}
                onNotationChange={setNotation}
                onLayoutChange={setLayout}
                onModeChange={setMode}
                actions={song ? <ExportMenu sheetRef={sheetRef} song={song} /> : null}
            />
            <SectionNav badges={badges} scopeId="cif" />

            {/* La hoja es lo que se captura al exportar a PDF o PNG */}
            <div ref={sheetRef} className="viewer-sheet" >
                {song && <ExportHead song={song} displayKey={displayKey} notation={notation} />}

                {sections.length === 0 ? (
                    <p className="empty-state">Agrega una sección para ver el cifrado aquí.</p>
                ) : (
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
                                onToggleHighlight={() =>
                                    setHighlighted((h) => (h === s.id ? null : s.id))
                                }
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
                )}
            </div>
        </div>
    );
}