'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { isActivePath, type NavItem } from '@/config/nav';
import { NAV_ICONS } from './nav-icons';

interface BottomNavProps {
    items: readonly NavItem[];
    /** Última pestaña (perfil o entrar). La dibuja la aplicación. */
    trailing?: ReactNode;
}

/** Barra de pestañas inferior de las pantallas estrechas. En escritorio la oculta el CSS. */
export default function BottomNav({ items, trailing }: BottomNavProps) {
    const pathname = usePathname();

    return (
        <nav className="bottom-nav" aria-label="Navegación principal">
            {items.map((item) => {
                const Icon = NAV_ICONS[item.icon];
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="tab-item"
                        aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
                    >
                        <span className="tab-icon">
                            <Icon size={22} aria-hidden="true" />
                        </span>
                        <span className="tab-label">{item.label}</span>
                    </Link>
                );
            })}
            {trailing}
        </nav>
    );
}