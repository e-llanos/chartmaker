import Link from 'next/link';
import type { ReactNode } from 'react';
import { APP_NAME } from '@/config/app';

const LINKS = [
    { href: '/songs', label: 'Canciones' },
    { href: '/theory', label: 'Teoría' },
] as const;

interface NavbarProps {
    /** Menú del usuario (entrar / salir), que lo dibuja la aplicación. */
    userMenu?: ReactNode;
}

export default function Navbar({ userMenu }: NavbarProps) {
    return (
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
    );
}