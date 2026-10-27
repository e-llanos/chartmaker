import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getSongById } from '@/lib/data/songs';
import { toSongInput } from '@/lib/data/song.constants';
import EditSongClient from './EditSongClient';

interface EditSongPageProps {
    params: Promise<{ id: string }>;
}

export default function EditSongPage({ params }: EditSongPageProps) {
    return (
        <Suspense fallback={<p>Cargando editor…</p>}>
            <EditSongLoader params={params} />
        </Suspense>
    );
}

async function EditSongLoader({ params }: EditSongPageProps) {
    const { id } = await params;
    const song = await getSongById(id);
    if (!song) notFound();
    return <EditSongClient id={id} initial={toSongInput(song)} />;
}