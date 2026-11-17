import 'server-only';

import { and, eq } from 'drizzle-orm';
import { getDb } from '@/server/db/client';
import { songFavorites } from '@/server/db/schema';

/** Guarda la canción si no estaba, o la quita si ya lo estaba. Devuelve si queda guardada. */
export async function toggleFavorite(userId: string, songId: string): Promise<boolean> {
    const db = getDb();
    const removed = await db
        .delete(songFavorites)
        .where(and(eq(songFavorites.userId, userId), eq(songFavorites.songId, songId)))
        .returning({ songId: songFavorites.songId });
    if (removed.length > 0) return false;

    await db.insert(songFavorites).values({ userId, songId }).onConflictDoNothing();
    return true;
}