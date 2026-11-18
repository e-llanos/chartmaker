import { cleanName, nameKey } from '@/domain/song/names';
import type { Database } from './client';
import { albums, artists } from './schema';

/** Devuelve el id del artista con ese nombre (sin importar tildes ni mayúsculas), creándolo si no existe. */
export async function resolveArtist(db: Database, name: string): Promise<string | null> {
    const clean = cleanName(name);
    if (!clean) return null;
    const key = nameKey(clean);
    const [row] = await db
        .insert(artists)
        .values({ name: clean, nameKey: key })
        // Si ya existe se conserva la primera escritura; la actualización sin cambios solo sirve para obtener el id.
        .onConflictDoUpdate({ target: artists.nameKey, set: { nameKey: key } })
        .returning({ id: artists.id });
    return row?.id ?? null;
}

/** Igual que `resolveArtist`, para un álbum de ese artista (o sin artista). */
export async function resolveAlbum(db: Database, title: string, artistId: string | null): Promise<string | null> {
    const clean = cleanName(title);
    if (!clean) return null;
    const key = nameKey(clean);
    const [row] = await db
        .insert(albums)
        .values({ title: clean, titleKey: key, artistId })
        .onConflictDoUpdate({ target: [albums.artistId, albums.titleKey], set: { titleKey: key } })
        .returning({ id: albums.id });
    return row?.id ?? null;
}