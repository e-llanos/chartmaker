import 'server-only';

import path from 'node:path';
import { cache } from 'react';
import type { SongCreate, SongUpdate } from '@/domain/song/types';
import { createFileSongRepository } from './file-repository';

export type { SongRepository } from './repository';

/** Archivo de datos. Se puede cambiar con la variable CHARTMAKER_DATA_FILE. */
const DATA_FILE = process.env.CHARTMAKER_DATA_FILE ?? path.join(process.cwd(), 'data', 'songs.json');

const repository = createFileSongRepository(DATA_FILE);

export const listSongs = () => repository.list();

/** Se lee una sola vez por petición aunque la pidan el layout y la página. */
export const getSongById = cache((id: string) => repository.get(id));

export const createSong = (input: SongCreate) => repository.create(input);
export const updateSong = (id: string, changes: SongUpdate) => repository.update(id, changes);
export const updateSongBody = (id: string, body: string) => repository.update(id, { body });
export const deleteSong = (id: string) => repository.remove(id);
