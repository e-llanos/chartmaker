import { promises as fs } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { Song, SongInput, SongCreate, SongSummary, SongUpdate } from './song.types';

export type { Song, SongInput, SongSummary, SongUpdate } from './song.types';

const DB_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'songs.json');
import { DEFAULT_SONG_INPUT } from './song.constants';


/* ---------- Acceso al archivo ---------- */
/*
async function readAll(): Promise<Song[]> {
    try {
        const raw = await fs.readFile(DB_PATH, 'utf-8');
        const data: unknown = JSON.parse(raw);
        return Array.isArray(data) ? (data as Song[]) : [];
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
        throw err;
    }
}
    */

async function readAll(): Promise<Song[]> {
    try {
        const raw = await fs.readFile(DB_PATH, 'utf-8');
        const data: unknown = JSON.parse(raw);
        return Array.isArray(data) ? (data as Partial<Song>[]).map(withDefaults) : [];
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
        throw err;
    }
}

/** Escritura atómica: se escribe en un temporal y se renombra. */
async function writeAll(songs: Song[]): Promise<void> {
    const tmp = `${DB_PATH}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(songs, null, 2) + '\n', 'utf-8');
    await fs.rename(tmp, DB_PATH);
}

/** Cola de escrituras: evita que dos peticiones simultáneas se pisen. */
let queue: Promise<unknown> = Promise.resolve();
function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
    const next = queue.then(task, task);
    queue = next.catch(() => undefined);
    return next;
}

/* ---------- Lectura ---------- */

export async function listSongs(): Promise<SongSummary[]> {
    const songs = await readAll();
    return songs
        .map(({ id, title, artist, imageUrl, key, tempo, compas, updatedAt, chart }) => ({
            id, title, artist, imageUrl, key, tempo, compas, updatedAt,
            hasChart: Boolean(chart?.sections.length),
        }))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getSongById(id: string): Promise<Song | null> {
    const songs = await readAll();
    return songs.find((s) => s.id === id) ?? null;
}

/* ---------- Escritura ---------- */

export function createSong(input: SongInput): Promise<Song> {
    return withWriteLock(async () => {
        const songs = await readAll();
        const now = new Date().toISOString();
        const song = normalize({ id: randomUUID(), ...input, createdAt: now, updatedAt: now });
        songs.push(song);
        await writeAll(songs);
        return song;
    });
}

export function updateSong(id: string, changes: SongUpdate): Promise<Song | null> {
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

        songs[index] = merged;
        await writeAll(songs);
        return merged;
    });
}

export function updateSongBody(id: string, body: string): Promise<Song | null> {
    return updateSong(id, { body });
}

export function deleteSong(id: string): Promise<boolean> {
    return withWriteLock(async () => {
        const songs = await readAll();
        const next = songs.filter((s) => s.id !== id);
        if (next.length === songs.length) return false;
        await writeAll(next);
        return true;
    });
}


/** Rellena campos nuevos en canciones guardadas antes de añadirlos. */
function withDefaults(raw: Partial<Song>): Song {
    return {
        ...DEFAULT_SONG_INPUT,
        ...raw,
        id: raw.id ?? randomUUID(),
        createdAt: raw.createdAt ?? new Date().toISOString(),
        updatedAt: raw.updatedAt ?? new Date().toISOString(),
    };
}

/** Un imageUrl vacío significa "sin imagen": se elimina la propiedad. */
function normalize(song: Song): Song {
    if (!song.imageUrl) delete song.imageUrl;
    return song;
}
