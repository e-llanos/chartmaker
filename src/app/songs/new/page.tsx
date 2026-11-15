import { Suspense } from 'react';
import type { Metadata } from 'next';
import NewSongClient from '@/features/songs/components/NewSongClient';
import { authorizePage } from '@/server/auth/guard';
import Forbidden from '@/shared/ui/Forbidden';

export const metadata: Metadata = { title: 'Nueva canción' };

export default function NewSongPage() {
    return (
        <Suspense fallback={null}>
            <NewSongGate />
        </Suspense>
    );
}

async function NewSongGate() {
    const user = await authorizePage('song:create', '/songs/new');
    return user ? <NewSongClient /> : <Forbidden />;
}