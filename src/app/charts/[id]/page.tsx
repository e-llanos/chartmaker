import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ChartViewer from '@/components/chart/ChartViewer';
import SongTabs from '@/components/shared/SongTabs';
import { toSongInput } from '@/lib/data/song.constants';
import { getSongById } from '@/lib/data/songs';

interface ChartPageProps {
    params: Promise<{ id: string }>;
}

export default function ChartPage({ params }: ChartPageProps) {
    return (
        <main className="page-container">
            <Suspense fallback={<p>Cargando chart…</p>}>
                <ChartContent params={params} />
            </Suspense>
        </main>
    );
}

async function ChartContent({ params }: ChartPageProps) {
    const { id } = await params;
    const song = await getSongById(id);
    if (!song) notFound();

    return (
        <>
            <SongTabs id={id} active="chart" />
            <ChartViewer
                song={toSongInput(song)}
                chart={song.chart ?? { sections: [] }}
                editHref={`/charts/${id}/edit`}
            />
        </>
    );
}