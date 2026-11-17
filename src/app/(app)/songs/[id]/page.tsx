import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SongWorkspace from '@/features/songs/components/SongWorkspace';
import SongsBreadcrumbs from '@/features/songs/components/SongsBreadcrumbs';
import ViewSkeleton from '@/shared/ui/ViewSkeleton';
import { getSongById } from '@/server/songs';
import { parseView } from '@/config/routes';
import { can } from '@/domain/auth/roles';
import { getCurrentUser } from '@/server/auth/session';

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
    const [song, user] = await Promise.all([getSongById(id), getCurrentUser()]);
    if (!song) notFound();
    return (
        <>
            <SongsBreadcrumbs items={[{ label: 'Canciones', href: '/songs' }, { label: song.title || 'Sin título' }]} />
            <SongWorkspace
                song={song}
                initialView={parseView(view)}
                canEdit={can(user?.role, 'song:update')}
                canDelete={can(user?.role, 'song:delete')}
            />
        </>
    );
}