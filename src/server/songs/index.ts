import 'server-only';

import { cache } from 'react';
import type { SongCreate, SongUpdate } from '@/domain/song/types';
import { createPostgresSongRepository } from './postgres-repository';

export type { SongRepository } from './repository';

const repository = createPostgresSongRepository();

export const listSongs = () => repository.list();

/** Se lee una sola vez por petición aunque la pidan el layout y la página. */
export const getSongById = cache((id: string) => repository.get(id));

export const createSong = (input: SongCreate, ownerId?: string) => repository.create(input, ownerId);
export const updateSong = (id: string, changes: SongUpdate) => repository.update(id, changes);
export const updateSongBody = (id: string, body: string) => repository.update(id, { body });
export const deleteSong = (id: string) => repository.remove(id);