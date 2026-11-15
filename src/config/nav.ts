export type RailIconName = 'home' | 'songs' | 'theory' | 'settings' | 'help';

export interface NavItem {
    href: string;
    label: string;
    icon: RailIconName;
}

/** Sección principal de la barra lateral. */
export const NAV_MAIN: readonly NavItem[] = [
    { href: '/', label: 'Inicio', icon: 'home' },
    { href: '/songs', label: 'Canciones', icon: 'songs' },
    { href: '/theory', label: 'Teoría', icon: 'theory' },
    { href: '/settings', label: 'Ajustes', icon: 'settings' },
];

/** Parte inferior de la barra, encima del perfil. */
export const NAV_FOOTER: readonly NavItem[] = [{ href: '/help', label: 'Ayuda', icon: 'help' }];

export function isActivePath(pathname: string, href: string): boolean {
    return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}