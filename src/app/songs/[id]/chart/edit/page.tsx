import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { toSongInput } from '@/domain/song/constants';
import { getSongById } from '@/server/songs';
import EditChartClient from '@/features/songs/components/EditChartClient';

interface EditChartPageProps {
    params: Promise<{ id: string }>;
}

export default function EditChartPage({ params }: EditChartPageProps) {
    return (
        <Suspense fallback={<p>Cargando editor…</p>}>
            <EditChartLoader params={params} />
        </Suspense>
    );
}

async function EditChartLoader({ params }: EditChartPageProps) {
    const { id } = await params;
    const song = await getSongById(id);
    if (!song) notFound();
    return (
        <EditChartClient
            id={id}
            song={toSongInput(song)}
            initial={song.chart ?? { sections: [] }}
        />
    );
}