'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME } from '@/config/app';
import { NAV_FOOTER, NAV_MAIN, isActivePath, type NavItem } from '@/config/nav';
import BrandMark from '@/shared/ui/BrandMark';
import BottomNav from './BottomNav';
import { NAV_ICONS } from './nav-icons';
import ProfileMenu, { type RailUser } from './ProfileMenu';

function RailLink({ item, pathname }: { item: NavItem; pathname: string }) {
    const Icon = NAV_ICONS[item.icon];
    return (
        <Link
            href={item.href}
            className="rail-link"
            data-label={item.label}
            aria-label={item.label}
            aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
        >
            <Icon size={22} aria-hidden="true" />
        </Link>
    );
}

export default function Sidebar({ user }: { user: RailUser }) {
    const pathname = usePathname();

    return (
        <>
            {/* Escritorio */}
            <aside id="app-rail" className="rail" aria-label="Navegación principal">
                <Link href="/" className="rail-brand" aria-label={APP_NAME}>
                    <BrandMark size={34} />
                </Link>

                <nav className="rail-group" aria-label="Secciones">
                    {NAV_MAIN.map((item) => (
                        <RailLink key={item.href} item={item} pathname={pathname} />
                    ))}
                </nav>

                <nav className="rail-group rail-bottom" aria-label="Ayuda y perfil">
                    {NAV_FOOTER.map((item) => (
                        <RailLink key={item.href} item={item} pathname={pathname} />
                    ))}
                    <ProfileMenu user={user} />
                </nav>
            </aside>

            {/* Móvil */}
            <BottomNav items={NAV_MAIN} trailing={<ProfileMenu user={user} variant="tab" />} />
        </>
    );
}