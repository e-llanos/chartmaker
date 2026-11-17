'use client';

import { createContext, useMemo, useState, type ReactNode } from 'react';

interface ShellState {
    open: boolean;
    toggle: () => void;
}

/** Lo usa el botón de contraer, que puede estar en cualquier página de canciones. */
export const LibraryShellContext = createContext<ShellState | null>(null);

interface LibraryShellProps {
    /** Estado guardado en la cookie `lib-side` (lo lee el servidor). */
    initialOpen: boolean;
    sidebar: ReactNode;
    children: ReactNode;
}

export default function LibraryShell({ initialOpen, sidebar, children }: LibraryShellProps) {
    const [open, setOpen] = useState(initialOpen);

    const value = useMemo<ShellState>(
        () => ({
            open,
            toggle: () => {
                const next = !open;
                setOpen(next);
                document.cookie = `lib-side=${next ? 'open' : 'closed'}; path=/; max-age=31536000; samesite=lax`;
            },
        }),
        [open],
    );

    return (
        <LibraryShellContext.Provider value={value}>
            <div className="lib-page" data-sidebar={open ? 'open' : 'closed'}>
                {sidebar}
                <section className="lib-main">{children}</section>
            </div>
        </LibraryShellContext.Provider>
    );
}