import 'server-only';

import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DEFAULT_SONG_INPUT } from '@/domain/song/constants';
import type { Song } from '@/domain/song/types';
import type { SongRepository } from './repository';

/** Fecha de las canciones antiguas sin marca de tiempo. Es fija: leer no debe depender de la hora actual. */
const LEGACY_DATE = new Date(0).toISOString();

/** Rellena campos nuevos en canciones guardadas antes de añadirlos. */
function withDefaults(raw: Partial<Song>): Song {
    return {
        ...DEFAULT_SONG_INPUT,
        ...raw,
        id: raw.id ?? randomUUID(),
        createdAt: raw.createdAt ?? LEGACY_DATE,
        updatedAt: raw.updatedAt ?? LEGACY_DATE,
    };
}

/** Un imageUrl vacío significa "sin imagen": se elimina la propiedad. */
function normalize(song: Song): Song {
    if (!song.imageUrl) delete song.imageUrl;
    return song;
}

/** Repositorio basado en un archivo JSON. Solo para local o discos persistentes. */
export function createFileSongRepository(filePath: string): SongRepository {
    async function readAll(): Promise<Song[]> {
        try {
            const raw = await fs.readFile(filePath, 'utf-8');
            const data: unknown = JSON.parse(raw);
            return Array.isArray(data) ? (data as Partial<Song>[]).map(withDefaults) : [];
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
            throw err;
        }
    }

    /** Escritura atómica: se escribe en un temporal y se renombra. */
    async function writeAll(songs: Song[]): Promise<void> {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        const tmp = `${filePath}.tmp`;
        await fs.writeFile(tmp, JSON.stringify(songs, null, 2) + '\n', 'utf-8');
        await fs.rename(tmp, filePath);
    }

    /** Cola de escrituras: evita que dos peticiones simultáneas se pisen. */
    let queue: Promise<unknown> = Promise.resolve();
    function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
        const next = queue.then(task, task);
        queue = next.catch(() => undefined);
        return next;
    }

    return {
        async list() {
            const songs = await readAll();
            return songs
                .map(({ id, title, artist, imageUrl, key, tempo, compas, updatedAt, chart, score }) => ({
                    id, title, artist, imageUrl, key, tempo, compas, updatedAt,
                    hasChart: Boolean(chart?.sections.length),
                    hasScore: Boolean(score?.sections.length),
                }))
                .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        },

        async get(id) {
            const songs = await readAll();
            return songs.find((s) => s.id === id) ?? null;
        },

        create(input) {
            return withWriteLock(async () => {
                const songs = await readAll();
                const now = new Date().toISOString();
                const song = normalize({ id: randomUUID(), ...input, createdAt: now, updatedAt: now });
                songs.push(song);
                await writeAll(songs);
                return song;
            });
        },

        update(id, changes) {
            return withWriteLock(async () => {
                const songs = await readAll();
                const index = songs.findIndex((s) => s.id === id);
                const current = songs[index];
                if (!current) return null;

                const { chart, score, ...fields } = changes;
                const merged: Song = { ...current, ...fields, id, updatedAt: new Date().toISOString() };
                if (chart === null) delete merged.chart;
                else if (chart) merged.chart = chart;
                if (score === null) delete merged.score;
                else if (score) merged.score = score;

                const updated = normalize(merged);
                songs[index] = updated;
                await writeAll(songs);
                return updated;
            });
        },

        remove(id) {
            return withWriteLock(async () => {
                const songs = await readAll();
                const next = songs.filter((s) => s.id !== id);
                if (next.length === songs.length) return false;
                await writeAll(next);
                return true;
            });
        },
    };
}
