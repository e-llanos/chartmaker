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
        <Suspense
            fallback={
                <main className="page-song">
                    <ViewSkeleton />
                </main>
            }
        >
            <SongLoader params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function SongLoader({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { view } = await searchParams;
    const [song, user] = await Promise.all([getSongById(id), getCurrentUser()]);
    if (!song) notFound();
    return (
        <>
            {/* Fuera de la columna centrada: arriba a la izquierda del área principal */}
            <SongsBreadcrumbs items={[{ label: 'Canciones', href: '/songs' }, { label: song.title || 'Sin título' }]} />
            <main className="page-song">
                <SongWorkspace
                    song={song}
                    initialView={parseView(view)}
                    canEdit={can(user?.role, 'song:update')}
                    canDelete={can(user?.role, 'song:delete')}
                    canExportFile={can(user?.role, 'song:export')}
                />
            </main>
        </>
    );
}