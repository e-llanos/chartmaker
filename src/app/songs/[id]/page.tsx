import { Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import SongTabs from '@/components/shared/SongTabs';
import CifradoViewer from '@/components/cifrado/CifradoViewer';
import { getSongById } from '@/lib/data/songs';

interface SongPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(
    { params }: SongPageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const song = await getSongById(id);

    if (!song) {
        return {
            title: 'Canción no encontrada',
            description: 'La canción que buscas no existe o fue eliminada.',
        };
    }

    return {
        title: song.title,
        description: `Aprende a tocar ${song.title}`,
        openGraph: {
            title: `${song.title} - ${song.artist}`,
            description: `Cifrado de acordes para ${song.title}.`,
            images: song.imageUrl ? [song.imageUrl] : [],
        },
    };
}

export default function SongPage({ params }: SongPageProps) {
    return (
        <main className="page-container">
            <Suspense fallback={<p>Cargando canción…</p>}>
                <SongContent params={params} />
            </Suspense>
        </main>
    );
}

async function SongContent({ params }: SongPageProps) {
    const { id } = await params;
    const song = await getSongById(id);
    if (!song) notFound();

    return (
        <>
            <SongTabs id={id} active="cifrado" />
            <CifradoViewer
                chordProText={song.body}
                originalKey={song.key}
                title={song.title}
                meta={{
                    artist: song.artist,
                    album: song.album,
                    imageUrl: song.imageUrl,
                    tempo: song.tempo,
                    compas: song.compas,
                }}
                editHref={`/songs/${id}/edit`}
                deleteId={id}
                chart={song.chart}
            />
        </>
    );
}