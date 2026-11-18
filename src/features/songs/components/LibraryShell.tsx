'use client';

import {
    createContext,
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from 'react';

const MOBILE = '(max-width: 720px)';

function subscribe(callback: () => void) {
    const media = window.matchMedia(MOBILE);
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
}

/** En el servidor siempre es falso; en el navegador sigue el ancho de la pantalla. */
const useIsMobile = () =>
    useSyncExternalStore(
        subscribe,
        () => window.matchMedia(MOBILE).matches,
        () => false,
    );

interface ShellState {
    /** ¿Está visible la biblioteca en este momento? (escritorio: panel; móvil: cajón). */
    open: boolean;
    toggle: () => void;
    /** En móvil, cierra el cajón (por ejemplo, al elegir una sección). */
    closeDrawer: () => void;
}

/** Lo usan el botón de contraer y el panel, que pueden estar en cualquier página de canciones. */
export const LibraryShellContext = createContext<ShellState | null>(null);

interface LibraryShellProps {
    /** Estado de escritorio guardado en la cookie `lib-side` (lo lee el servidor). */
    initialOpen: boolean;
    sidebar: ReactNode;
    children: ReactNode;
}

export default function LibraryShell({ initialOpen, sidebar, children }: LibraryShellProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(initialOpen); // escritorio: se recuerda
    const [drawer, setDrawer] = useState(false); // móvil: empieza cerrado

    // Escape cierra el cajón en móvil.
    useEffect(() => {
        if (!drawer) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setDrawer(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [drawer]);

    const value = useMemo<ShellState>(
        () => ({
            open: isMobile ? drawer : open,
            toggle: () => {
                if (isMobile) {
                    setDrawer((d) => !d);
                    return;
                }
                const next = !open;
                setOpen(next);
                document.cookie = `lib-side=${next ? 'open' : 'closed'}; path=/; max-age=31536000; samesite=lax`;
            },
            closeDrawer: () => setDrawer(false),
        }),
        [isMobile, drawer, open],
    );

    return (
        <LibraryShellContext.Provider value={value}>
            <div className="lib-page" data-sidebar={open ? 'open' : 'closed'} data-drawer={drawer ? 'open' : 'closed'}>
                {drawer && <div className="lib-backdrop" onClick={() => setDrawer(false)} aria-hidden="true" />}
                {sidebar}
                <section className="lib-main">{children}</section>
            </div>
        </LibraryShellContext.Provider>
    );
}