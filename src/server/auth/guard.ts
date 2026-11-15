import 'server-only';

import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { loginPath } from '@/config/routes';
import { can, type Permission } from '@/domain/auth/roles';
import { getCurrentUser, type CurrentUser } from './session';

/**
 * Para páginas: sin sesión lleva al login (y vuelve a `next` después); con sesión pero sin
 * permiso devuelve null para que la página muestre el aviso.
 */
export async function authorizePage(permission: Permission, next: string): Promise<CurrentUser | null> {
    const user = await getCurrentUser();
    if (!user) redirect(loginPath(next));
    return can(user.role, permission) ? user : null;
}

export type ApiAuth = { ok: true; user: CurrentUser } | { ok: false; response: NextResponse };

/** Para rutas de la API: responde 401 sin sesión y 403 sin permiso. */
export async function authorizeApi(permission: Permission): Promise<ApiAuth> {
    const user = await getCurrentUser();
    if (!user) {
        return { ok: false, response: NextResponse.json({ error: 'Inicia sesión para continuar' }, { status: 401 }) };
    }
    if (!can(user.role, permission)) {
        return { ok: false, response: NextResponse.json({ error: 'No tienes permiso para esta acción' }, { status: 403 }) };
    }
    return { ok: true, user };
}