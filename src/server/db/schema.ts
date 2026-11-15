import { randomUUID } from 'node:crypto';
import { index, jsonb, pgTable, smallint, text, timestamp } from 'drizzle-orm/pg-core';
import type { Chart } from '@/domain/chart/types';
import { user } from './auth-schema';

export * from './auth-schema';

export const songs = pgTable(
    'songs',
    {
        /** Texto y no uuid: las canciones antiguas pueden tener ids como "1". Las nuevas son UUID. */
        id: text('id').primaryKey().$defaultFn(() => randomUUID()),
        /** Versión del formato del chart guardado (ver domain/song/migrate.ts). */
        schemaVersion: smallint('schema_version').notNull().default(2),
        title: text('title').notNull(),
        artist: text('artist').notNull().default(''),
        album: text('album').notNull().default(''),
        imageUrl: text('image_url'),
        key: text('key').notNull(),
        tempo: smallint('tempo').notNull(),
        /** Compás: "4/4", "6/8"… */
        compas: text('compas').notNull(),
        /** El cifrado en texto (formato ChordPro). */
        body: text('body').notNull().default(''),
        /** El chart completo. Se lee y se escribe entero, por eso va en un solo JSONB. */
        chart: jsonb('chart').$type<Chart>(),
        ownerId: text('owner_id').references(() => user.id, { onDelete: 'set null' }),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [index('songs_updated_at_idx').on(t.updatedAt.desc())],
);

export type SongRow = typeof songs.$inferSelect;
export type NewSongRow = typeof songs.$inferInsert;