import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ScoreViewer from '@/components/score/ScoreViewer';
import SongTabs from '@/components/shared/SongTabs';
import { toSongInput } from '@/lib/data/song.constants';
import { getSongById } from '@/lib/data/songs';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function AdvancedChartPage({ params }: PageProps) {
    return (
        <main className="page-container">
            <Suspense fallback={<p>Cargando chart avanzado…</p>}>
                <AdvancedContent params={params} />
            </Suspense>
        </main>
    );
}

async function AdvancedContent({ params }: PageProps) {
    const { id } = await params;
    const song = await getSongById(id);
    if (!song) notFound();

    return (
        <>
            <SongTabs id={id} active="advanced" />
            <ScoreViewer
                song={toSongInput(song)}
                score={song.score ?? { sections: [] }}
                chart={song.chart}
                editHref={`/charts/${id}/advanced/edit`}
            />
        </>
    );
}