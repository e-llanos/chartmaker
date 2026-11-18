import Link from 'next/link';
import type { ReactNode } from 'react';
import { APP_NAME } from '@/config/app';
import type { NavItem } from '@/config/nav';
import MobileNav from './MobileNav';

const LINKS: readonly NavItem[] = [
    { href: '/songs', label: 'Canciones', icon: 'songs' },
    { href: '/theory', label: 'Teoría', icon: 'theory' },
];

interface NavbarProps {
    userMenu?: ReactNode;
}

export default function Navbar({ userMenu }: NavbarProps) {
    return (
        <>
            <MobileNav links={LINKS} footer={userMenu} />
            <header className="navbar">
                <nav className="navbar-inner" aria-label="Principal">
                    <Link href="/" className="navbar-brand">{APP_NAME}</Link>
                    <ul className="navbar-links">
                        {LINKS.map((l) => (
                            <li key={l.href}>
                                <Link href={l.href} className="navbar-link">{l.label}</Link>
                            </li>
                        ))}
                    </ul>
                    {userMenu && <div className="navbar-user">{userMenu}</div>}
                </nav>
            </header>
        </>
    );
}