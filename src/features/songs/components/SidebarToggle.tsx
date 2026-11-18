'use client';

import { useContext } from 'react';
import { LuPanelLeftClose, LuPanelLeftOpen } from 'react-icons/lu';
import { LibraryShellContext } from './LibraryShell';

export default function SidebarToggle() {
    const shell = useContext(LibraryShellContext);
    if (!shell) return null;

    const label = shell.open ? 'Contraer biblioteca' : 'Expandir biblioteca';
    return (
        <>
            <button
                type="button"
                className="icon-btn"
                onClick={shell.toggle}
                aria-expanded={shell.open}
                aria-controls="lib-side"
                aria-label={label}
                title={label}
            >
                {shell.open ? <LuPanelLeftClose size={18} aria-hidden="true" /> : <LuPanelLeftOpen size={18} aria-hidden="true" />}
            </button>
            <span className="crumbs-sep" aria-hidden="true" />
        </>
    );
}