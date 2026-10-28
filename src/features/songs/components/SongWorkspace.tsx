'use client';

import { useMemo, useState } from 'react';
import ChartViewer from '@/features/chart/components/ChartViewer';
import ChordSheetViewer from '@/features/chordsheet/components/ChordSheetViewer';
import ScoreViewer from '@/features/score/components/ScoreViewer';
import { toSongInput } from '@/domain/song/constants';
import type { Song } from '@/domain/song/types';
import { songEditPath, type SongView } from '@/config/routes';
import EmptyState from '@/shared/ui/EmptyState';
import SongActions from '@/features/songs/components/SongActions';
import SongHeader from '@/shared/viewer/SongHeader';
import SongTabs from '@/features/songs/components/SongTabs';
import { useViewerSettings } from '@/shared/viewer/useViewerSettings';

interface SongWorkspaceProps {
    song: Song;
    initialView: SongView;
}

export default function SongWorkspace({ song, initialView }: SongWorkspaceProps) {
    const [view, setView] = useState<SongView>(initialView);
    const settings = useViewerSettings(); // compartido por las tres vistas
    const input = useMemo(() => toSongInput(song), [song]);

    const hasChart = Boolean(song.chart?.sections.length);
    const hasScore = Boolean(song.score?.sections.length);

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
                actions={<SongActions id={song.id} title={input.title} view={view} />}
            />
            <SongTabs
                view={view}
                onChange={selectView}
                available={{ cifrado: true, chart: hasChart, advanced: hasScore }}
            />

            {/* Los tres paneles quedan montados: al cambiar de pestaña se conserva
                la disposición, el modo y la sección resaltada de cada uno. */}
            <div hidden={view !== 'cifrado'}>
                <ChordSheetViewer
                    chordProText={input.body}
                    originalKey={input.key}
                    title={input.title}
                    meta={input}
                    chart={song.chart}
                    score={song.score}
                    settings={settings}
                    hideHeader
                />
            </div>

            <div hidden={view !== 'chart'}>
                {hasChart && song.chart ? (
                    <ChartViewer song={input} chart={song.chart} score={song.score} settings={settings} hideHeader />
                ) : (
                    <EmptyState
                        title="Aún no hay chart"
                        description="Un chart muestra la canción por compases. Puedes generarlo a partir del cifrado y ajustarlo."
                        href={songEditPath(song.id, 'chart')}
                        cta="Crear chart"
                    />
                )}
            </div>

            <div hidden={view !== 'advanced'}>
                {hasScore && song.score ? (
                    <ScoreViewer song={input} score={song.score} chart={song.chart} settings={settings} hideHeader />
                ) : (
                    <EmptyState
                        title="Aún no hay chart avanzado"
                        description="Incluye tiempos, barras de repetición, casillas y símbolos de partitura."
                        href={songEditPath(song.id, 'advanced')}
                        cta="Crear chart avanzado"
                    />
                )}
            </div>
        </>
    );
}