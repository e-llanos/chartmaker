'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
    LuBookOpen,
    LuCircleHelp,
    LuHouse,
    LuListMusic,
    LuSlidersHorizontal,
    LuMenu,
    LuX
} from 'react-icons/lu';
import { isActivePath, type NavItem, type RailIconName } from '@/config/nav';

const NAV_ICONS: Record<RailIconName, IconType> = {
    home: LuHouse,
    songs: LuListMusic,
    theory: LuBookOpen,
    settings: LuSlidersHorizontal,
    help: LuCircleHelp,
};

interface MobileNavProps {
    links: readonly NavItem[];
    /** Al pie del panel (entrar / salir). Lo dibuja la aplicación, igual que en la navbar. */
    footer?: ReactNode;
}

/**
 * Menú de la navbar en pantallas estrechas: botón arriba a la izquierda y panel lateral,
 * igual que la barra lateral con sesión. En escritorio no se muestra (lo oculta el CSS).
 */
export default function MobileNav({ links, footer }: MobileNavProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [lastPath, setLastPath] = useState(pathname);

    // Al cambiar de ruta (enlace, botón atrás…) el panel se cierra solo.
    if (pathname !== lastPath) {
        setLastPath(pathname);
        setOpen(false);
    }

    // Escape cierra el panel.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    // Un enlace a la página actual no cambia la ruta, así que también se cierra al pulsarlo.
    const closeOnLink = (e: MouseEvent<HTMLElement>) => {
        if ((e.target as HTMLElement).closest('a')) setOpen(false);
    };

    return (
        <>
            <button
                type="button"
                className="navbar-toggle"
                aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={open}
                aria-controls="nav-drawer"
                onClick={() => setOpen((o) => !o)}
            >
                {open ? <LuX size={22} aria-hidden="true" /> : <LuMenu size={22} aria-hidden="true" />}
            </button>
            {open && <div className="navbar-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}

            <aside id="nav-drawer" className="nav-drawer" data-open={open} aria-label="Menú de navegación" onClick={closeOnLink}>
                <ul className="nav-drawer-links">
                    {links.map((l) => {
                        const Icon = NAV_ICONS[l.icon];
                        return (
                            <li key={l.href}>
                                <Link
                                    href={l.href}
                                    className="navbar-link"
                                    aria-current={isActivePath(pathname, l.href) ? 'page' : undefined}
                                >
                                    <Icon className="nav-link-icon" size={20} aria-hidden="true" />
                                    {l.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                {footer && <div className="nav-drawer-footer">{footer}</div>}
            </aside>
        </>
    );
}