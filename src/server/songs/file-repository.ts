import 'server-only';

import { randomUUID } from 'node:crypto';
import { constants as fsConstants, promises as fs } from 'node:fs';
import path from 'node:path';
import { DEFAULT_SONG_INPUT } from '@/domain/song/constants';
import { migrateSong, SCHEMA_VERSION } from '@/domain/song/migrate';
import type { Song } from '@/domain/song/types';
import type { SongRepository } from './repository';

/** Fecha de las canciones antiguas sin marca de tiempo. Es fija: leer no debe depender de la hora actual. */
const LEGACY_DATE = new Date(0).toISOString();

/** Rellena campos nuevos en canciones guardadas antes de añadirlos. */
function withDefaults(raw: Partial<Song>): Song {
    return {
        ...DEFAULT_SONG_INPUT,
        ...raw,
        schemaVersion: SCHEMA_VERSION,
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

type Raw = Record<string, unknown>;

/** Repositorio basado en un archivo JSON. Solo para local o discos persistentes. */
export function createFileSongRepository(filePath: string): SongRepository {
    /** Contenido del archivo tal cual está guardado; null si no existe. */
    async function readRaw(): Promise<Raw[] | null> {
        try {
            const text = await fs.readFile(filePath, 'utf-8');
            const data: unknown = JSON.parse(text);
            return Array.isArray(data)
                ? data.filter((x): x is Raw => typeof x === 'object' && x !== null)
                : [];
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
            throw err;
        }
    }

    /** Siempre devuelve canciones en la versión actual (migra en memoria si hace falta). */
    async function readAll(): Promise<Song[]> {
        const raw = await readRaw();
        return (raw ?? []).map((r) => withDefaults(migrateSong(r).song as Partial<Song>));
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

    /** Migra el archivo a la versión actual, dejando antes una copia de la anterior. */
    async function migrateFile(): Promise<void> {
        try {
            const raw = await readRaw();
            if (!raw) return;
            const results = raw.map(migrateSong);
            if (!results.some((r) => r.changed)) return;

            const { dir, name, ext } = path.parse(filePath);
            const backup = path.join(dir, `${name}.backup-v1${ext}`);
            try {
                await fs.copyFile(filePath, backup, fsConstants.COPYFILE_EXCL);
            } catch (err) {
                // Si la copia ya existe se respeta (es la versión original); cualquier otro error aborta.
                if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
            }

            await writeAll(results.map((r) => withDefaults(r.song as Partial<Song>)));
            console.info(`[chartmaker] Datos migrados a la versión ${SCHEMA_VERSION}. Copia anterior: ${backup}`);

            const divergent = results.filter((r) => r.divergent).map((r) => String(r.song.title ?? r.song.id));
            if (divergent.length) {
                console.warn(
                    '[chartmaker] Estas canciones tenían chart y chart avanzado con acordes distintos. ' +
                    `Se conservó el avanzado; el chart anterior está en la copia: ${divergent.join(', ')}`,
                );
            }
        } catch (err) {
            console.warn('[chartmaker] No se pudo migrar el archivo de datos; se usa la versión migrada en memoria.', err);
        }
    }

    /** Se ejecuta una sola vez y siempre antes de la primera lectura o escritura. */
    let migration: Promise<void> | undefined;
    const ensureMigrated = () => (migration ??= withWriteLock(migrateFile));

    return {
        async list() {
            await ensureMigrated();
            const songs = await readAll();
            return songs
                .map(({ id, title, artist, imageUrl, key, tempo, compas, updatedAt, chart }) => ({
                    id, title, artist, imageUrl, key, tempo, compas, updatedAt,
                    hasChart: Boolean(chart?.sections.length),
                    ...(chart?.sections.length ? { chartStyle: chart.style } : {}),
                }))
                .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        },

        async get(id) {
            await ensureMigrated();
            const songs = await readAll();
            return songs.find((s) => s.id === id) ?? null;
        },

        async create(input) {
            await ensureMigrated();
            return withWriteLock(async () => {
                const songs = await readAll();
                const now = new Date().toISOString();
                const song = normalize({
                    id: randomUUID(),
                    ...input,
                    schemaVersion: SCHEMA_VERSION,
                    createdAt: now,
                    updatedAt: now,
                });
                songs.push(song);
                await writeAll(songs);
                return song;
            });
        },

        async update(id, changes) {
            await ensureMigrated();
            return withWriteLock(async () => {
                const songs = await readAll();
                const index = songs.findIndex((s) => s.id === id);
                const current = songs[index];
                if (!current) return null;

                const { chart, ...fields } = changes;
                const merged: Song = { ...current, ...fields, id, updatedAt: new Date().toISOString() };
                if (chart === null) delete merged.chart;
                else if (chart) merged.chart = chart;

                const updated = normalize(merged);
                songs[index] = updated;
                await writeAll(songs);
                return updated;
            });
        },

        async remove(id) {
            await ensureMigrated();
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