'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/server/auth/session';
import { getSongById } from '@/server/songs';
import { toggleFavorite } from '@/server/songs/favorites';

export async function toggleFavoriteAction(formData: FormData): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Inicia sesión para guardar canciones');

    const songId = formData.get('songId');
    if (typeof songId !== 'string' || !(await getSongById(songId))) return;

    await toggleFavorite(user.id, songId);
    revalidatePath('/songs', 'layout');
}