import Link from 'next/link';
import { APP_NAME } from '@/config/app';

const LINKS = [
    { href: '/songs', label: 'Canciones' },
    { href: '/theory', label: 'Teoría' },
] as const;

export default function Navbar() {
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
            </nav>
        </header>
    );
}