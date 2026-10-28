import type { Song, SongCreate, SongSummary, SongUpdate } from '@/domain/song/types';

/**
 * Contrato de almacenamiento de canciones. Hoy lo cumple un archivo JSON;
 * para pasar a una base de datos basta con otra implementación.
 */
export interface SongRepository {
    list(): Promise<SongSummary[]>;
    get(id: string): Promise<Song | null>;
    create(input: SongCreate): Promise<Song>;
    update(id: string, changes: SongUpdate): Promise<Song | null>;
    remove(id: string): Promise<boolean>;
}
