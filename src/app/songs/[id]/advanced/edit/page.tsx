import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { toSongInput } from '@/domain/song/constants';
import { getSongById } from '@/server/songs';
import EditScoreClient from '@/features/songs/components/EditScoreClient';

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