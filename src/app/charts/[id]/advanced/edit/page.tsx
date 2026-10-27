import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { toSongInput } from '@/lib/data/song.constants';
import { getSongById } from '@/lib/data/songs';
import EditScoreClient from './EditScoreClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditAdvancedChartPage({ params }: PageProps) {
    return (
        <Suspense fallback={<p>Cargando editor…</p>}>
            <EditScoreLoader params={params} />
        </Suspense>
    );
}

async function EditScoreLoader({ params }: PageProps) {
    const { id } = await params;
    const song = await getSongById(id);
    if (!song) notFound();
    return (
        <EditScoreClient
            id={id}
            song={toSongInput(song)}
            initial={song.score ?? { sections: [] }}
            baseChart={song.chart}
        />
    );
}