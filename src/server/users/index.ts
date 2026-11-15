import 'server-only';

import { asc, eq } from 'drizzle-orm';
import { toRole, type Role } from '@/domain/auth/roles';
import { getDb } from '@/server/db/client';
import { user } from '@/server/db/schema';

export interface UserSummary {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: string;
}

export async function listUsers(): Promise<UserSummary[]> {
    const rows = await getDb()
        .select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt })
        .from(user)
        .orderBy(asc(user.createdAt));
    return rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: toRole(r.role),
        createdAt: r.createdAt.toISOString(),
    }));
}

export async function setUserRole(id: string, role: Role): Promise<boolean> {
    const rows = await getDb().update(user).set({ role }).where(eq(user.id, id)).returning({ id: user.id });
    return rows.length > 0;
}