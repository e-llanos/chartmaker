import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';
import { loginPath } from '@/config/routes';

/**
 * Redirección optimista: sin cookie de sesión no se llega a las rutas de edición.
 * NO es una barrera de seguridad (una cookie falsa pasa); la comprobación real se repite
 * en cada página y en cada ruta de la API.
 */
export function proxy(request: NextRequest) {
    if (!getSessionCookie(request)) {
        const { pathname, search } = request.nextUrl;
        return NextResponse.redirect(new URL(loginPath(pathname + search), request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/songs/new', '/songs/:id/edit', '/songs/:id/:format/edit', '/admin/:path*', '/profile', '/settings'],
};