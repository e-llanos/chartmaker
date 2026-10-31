import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SongWorkspace from '@/features/songs/components/SongWorkspace';
import ViewSkeleton from '@/shared/ui/ViewSkeleton';
import { getSongById } from '@/server/songs';
import { parseView } from '@/config/routes';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ view?: string | string[] }>;
}

export default function SongPage({ params, searchParams }: PageProps) {
    return (
        <main className="page-container">
            <Suspense fallback={<ViewSkeleton />}>
                <SongLoader params={params} searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function SongLoader({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { view } = await searchParams;
    const song = await getSongById(id);
    if (!song) notFound();
    return <SongWorkspace song={song} initialView={parseView(view)} />;
}