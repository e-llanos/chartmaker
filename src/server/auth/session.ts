import 'server-only';

import { headers } from 'next/headers';
import { cache } from 'react';
import { toRole, type Role } from '@/domain/auth/roles';
import { getAuth } from './auth';

export interface CurrentUser {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: Role;
}

/** El usuario de la petición, o null si no ha entrado. Se consulta una sola vez por petición. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
    const session = await getAuth().api.getSession({ headers: await headers() });
    if (!session) return null;
    const { user } = session;
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        role: toRole((user as { role?: unknown }).role),
    };
});