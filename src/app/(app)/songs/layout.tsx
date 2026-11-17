import { cookies } from 'next/headers';
import { Suspense, type ReactNode } from 'react';
import LibraryShell from '@/features/songs/components/LibraryShell';
import LibrarySidebar from '@/features/songs/components/LibrarySidebar';
import { getCurrentUser } from '@/server/auth/session';
import { countSaved, countSongs } from '@/server/songs/catalog';

export default function SongsLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={null}>
            <SongsShell>{children}</SongsShell>
        </Suspense>
    );
}

/** Con sesión, todas las páginas de canciones llevan la biblioteca a la izquierda; sin sesión, no. */
async function SongsShell({ children }: { children: ReactNode }) {
    const user = await getCurrentUser();
    if (!user) return <>{children}</>;

    const [total, saved, store] = await Promise.all([countSongs(), countSaved(user.id), cookies()]);
    return (
        <LibraryShell
            initialOpen={store.get('lib-side')?.value !== 'closed'}
            sidebar={<LibrarySidebar total={total} saved={saved} />}
        >
            {children}
        </LibraryShell>
    );
}