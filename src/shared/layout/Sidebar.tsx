'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import {
    LuBookOpen,
    LuCircleHelp,
    LuHouse,
    LuListMusic,
    LuMenu,
    LuSlidersHorizontal,
    LuX,
} from 'react-icons/lu';
import { APP_NAME } from '@/config/app';
import { NAV_FOOTER, NAV_MAIN, isActivePath, type NavItem, type RailIconName } from '@/config/nav';
import BrandMark from '@/shared/ui/BrandMark';
import ProfileMenu, { type RailUser } from './ProfileMenu';

const ICONS: Record<RailIconName, IconType> = {
    home: LuHouse,
    songs: LuListMusic,
    theory: LuBookOpen,
    settings: LuSlidersHorizontal,
    help: LuCircleHelp,
};

interface RailLinkProps {
    item: NavItem;
    pathname: string;
    onNavigate: () => void;
}

function RailLink({ item, pathname, onNavigate }: RailLinkProps) {
    const Icon = ICONS[item.icon];
    return (
        <Link
            href={item.href}
            className="rail-link"
            data-label={item.label}
            aria-label={item.label}
            aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
            onClick={onNavigate}
        >
            <Icon size={22} aria-hidden="true" />
        </Link>
    );
}

export default function Sidebar({ user }: { user: RailUser }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false); // solo se usa en móvil
    const close = () => setOpen(false);

    // Escape cierra el menú lateral en móvil.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <>
            <button
                type="button"
                className="rail-toggle"
                aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={open}
                aria-controls="app-rail"
                onClick={() => setOpen((o) => !o)}
            >
                {open ? <LuX size={22} aria-hidden="true" /> : <LuMenu size={22} aria-hidden="true" />}
            </button>
            {open && <div className="rail-backdrop" onClick={close} aria-hidden="true" />}

            <aside id="app-rail" className="rail" data-open={open} aria-label="Navegación principal">
                <Link href="/" className="rail-brand" aria-label={APP_NAME} onClick={close}>
                    <BrandMark size={34} />
                </Link>

                <nav className="rail-group" aria-label="Secciones">
                    {NAV_MAIN.map((item) => (
                        <RailLink key={item.href} item={item} pathname={pathname} onNavigate={close} />
                    ))}
                </nav>

                <nav className="rail-group rail-bottom" aria-label="Ayuda y perfil">
                    {NAV_FOOTER.map((item) => (
                        <RailLink key={item.href} item={item} pathname={pathname} onNavigate={close} />
                    ))}
                    <ProfileMenu user={user} onNavigate={close} />
                </nav>
            </aside>
        </>
    );
}