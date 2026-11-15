import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { DEFAULT_ROLE } from '@/domain/auth/roles';
import { getDb } from '@/server/db/client';
import * as schema from '@/server/db/schema';
import { googleCredentials } from './providers';

const adminEmails = (): string[] =>
    (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

function createAuth() {
    const google = googleCredentials();

    return betterAuth({
        database: drizzleAdapter(getDb(), { provider: 'pg', schema }),
        secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL,
        socialProviders: {
            ...(google ? { google } : {}),
        },
        user: {
            additionalFields: {
                // El cliente nunca puede escribir el rol: solo el servidor.
                role: { type: 'string', required: false, defaultValue: DEFAULT_ROLE, input: false },
            },
        },
        databaseHooks: {
            user: {
                create: {
                    // Rol inicial: admin si el correo está en ADMIN_EMAILS y el proveedor lo confirmó.
                    before: async (user) => {
                        const isAdmin = user.emailVerified && adminEmails().includes(user.email.toLowerCase());
                        return { data: { ...user, role: isAdmin ? 'admin' : DEFAULT_ROLE } as typeof user };
                    },
                },
            },
        },
        plugins: [nextCookies()], // debe ser el último
    });
}

export type Auth = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as unknown as { __chartmakerAuth?: Auth };

export function getAuth(): Auth {
    return (globalForAuth.__chartmakerAuth ??= createAuth());
}