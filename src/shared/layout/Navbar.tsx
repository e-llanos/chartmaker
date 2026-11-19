import Link from 'next/link';
import type { ReactNode } from 'react';
import { APP_NAME } from '@/config/app';
import type { NavItem } from '@/config/nav';
import BottomNav from './BottomNav';

const LINKS: readonly NavItem[] = [
    { href: '/songs', label: 'Canciones', icon: 'songs' },
    { href: '/theory', label: 'Teoría', icon: 'theory' },
];

/** Pestañas de la barra inferior sin sesión. */
const TABS: readonly NavItem[] = [{ href: '/', label: 'Inicio', icon: 'home' }, ...LINKS];

interface NavbarProps {
    /** Entrar, en la navbar de escritorio. */
    userMenu?: ReactNode;
    /** Última pestaña de la barra inferior (entrar). */
    bottomTrailing?: ReactNode;
}

export default function Navbar({ userMenu, bottomTrailing }: NavbarProps) {
    return (
        <>
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
            <BottomNav items={TABS} trailing={bottomTrailing} />
        </>
    );
}