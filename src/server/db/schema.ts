import { randomUUID } from 'node:crypto';
import { index, jsonb, pgTable, smallint, text, timestamp, primaryKey, unique } from 'drizzle-orm/pg-core';
import type { Chart } from '@/domain/chart/types';
import { user } from './auth-schema';

export * from './auth-schema';

export const artists = pgTable('artists', {
    id: text('id').primaryKey().$defaultFn(() => randomUUID()),
    name: text('name').notNull(),
    /** Nombre sin tildes ni mayúsculas: dos escrituras del mismo artista comparten esta clave. */
    nameKey: text('name_key').notNull().unique(),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const albums = pgTable(
    'albums',
    {
        id: text('id').primaryKey().$defaultFn(() => randomUUID()),
        title: text('title').notNull(),
        titleKey: text('title_key').notNull(),
        artistId: text('artist_id').references(() => artists.id, { onDelete: 'set null' }),
        /** Portada del álbum; si falta, se usa la de una de sus canciones. */
        imageUrl: text('image_url'),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    // Un mismo título puede existir en artistas distintos; sin artista, no se repite.
    (t) => [unique('albums_artist_title_key').on(t.artistId, t.titleKey).nullsNotDistinct()],
);

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
        artistId: text('artist_id').references(() => artists.id, { onDelete: 'set null' }),
        albumId: text('album_id').references(() => albums.id, { onDelete: 'set null' }),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index('songs_updated_at_idx').on(t.updatedAt.desc()),
        index('songs_artist_id_idx').on(t.artistId),
        index('songs_album_id_idx').on(t.albumId),
    ],
);

/** Canciones guardadas por cada usuario (el corazón de la biblioteca). */
export const songFavorites = pgTable(
    'song_favorites',
    {
        userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
        songId: text('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [primaryKey({ columns: [t.userId, t.songId] }), index('song_favorites_song_idx').on(t.songId)],
);

export type SongRow = typeof songs.$inferSelect;
export type NewSongRow = typeof songs.$inferInsert;