import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getSongById } from '@/server/songs';
import { toSongInput } from '@/domain/song/constants';
import EditSongClient from '@/features/songs/components/EditSongClient';

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