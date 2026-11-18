import { Suspense } from 'react';
import type { Metadata } from 'next';
import { parseSongQuery, type RawParams } from '@/domain/song/query';
import { getCurrentUser } from '@/server/auth/session';
import CatalogView, { CATALOG_DEFAULTS } from './_components/CatalogView';
import LibraryView, { LIBRARY_DEFAULTS } from './_components/LibraryView';

export const metadata: Metadata = {
    title: 'Canciones',
    description: 'Revisa las canciones disponibles.',
}

interface PageProps {
    searchParams: Promise<RawParams>;
}

export default function SongsPage({ searchParams }: PageProps) {
    return (
        <Suspense fallback={<div className="songs-skeleton" aria-hidden="true" />}>
            <SongsContent searchParams={searchParams} />
        </Suspense>
    );
}

/** Con sesión, la biblioteca; sin sesión, el catálogo público. */
async function SongsContent({ searchParams }: PageProps) {
    const [raw, user] = await Promise.all([searchParams, getCurrentUser()]);
    if (!user) return <CatalogView query={parseSongQuery(raw, CATALOG_DEFAULTS)} />;
    return <LibraryView query={parseSongQuery(raw, LIBRARY_DEFAULTS)} user={user} />;
}