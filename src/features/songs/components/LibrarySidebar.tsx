'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useContext } from 'react';
import { LuHeart, LuListMusic, LuPlus } from 'react-icons/lu';
import { LibraryShellContext } from './LibraryShell';

interface LibrarySidebarProps {
    total: number;
    saved: number;
}

export default function LibrarySidebar({ total, saved }: LibrarySidebarProps) {
    const pathname = usePathname();
    const savedView = useSearchParams().get('view') === 'saved';
    const shell = useContext(LibraryShellContext);
    const close = () => shell?.closeDrawer();
    // Solo se marca en la lista; dentro de una canción no hay sección activa.
    const onList = pathname === '/songs';

    return (
        <aside id="lib-side" className="lib-side" aria-label="Biblioteca">
            <h2>Canciones</h2>

            <p className="lib-side-label">Biblioteca</p>
            <Link
                href="/songs"
                className="lib-side-link"
                aria-current={onList && !savedView ? 'page' : undefined}
                onClick={close}
            >
                <LuListMusic size={16} aria-hidden="true" />
                <span>Todas las canciones</span>
                <span className="count">{total}</span>
            </Link>
            <Link
                href="/songs?view=saved"
                className="lib-side-link"
                aria-current={onList && savedView ? 'page' : undefined}
                onClick={close}
            >
                <LuHeart size={16} aria-hidden="true" />
                <span>Canciones guardadas</span>
                <span className="count">{saved}</span>
            </Link>

            <p className="lib-side-label">Carpetas</p>
            <span className="lib-side-link is-soon" title="Próximamente">
                <LuPlus size={16} aria-hidden="true" />
                <span>Nueva carpeta</span>
            </span>
        </aside>
    );
}