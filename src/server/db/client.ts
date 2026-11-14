import 'server-only';

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type Database = PostgresJsDatabase<typeof schema>;

/** El modo desarrollo recarga los módulos: sin esto abriría una conexión nueva en cada recarga. */
const globalForDb = globalThis as unknown as { __chartmakerDb?: Database };

function connect(): Database {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('Falta DATABASE_URL. Copia .env.example a .env.local y ajústala.');
    const client = postgres(url, {
        // Los proveedores con pooler de conexiones (Neon, Supabase) no admiten sentencias preparadas.
        prepare: false,
        max: process.env.NODE_ENV === 'production' ? 10 : 3,
    });
    return drizzle(client, { schema });
}

export function getDb(): Database {
    return (globalForDb.__chartmakerDb ??= connect());
}