import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { listSongs } from '@/lib/data/songs';
import ImportSongButton from '@/components/shared/ImportSongButton';


export const metadata: Metadata = {
    title: 'Cifrados',
    description: 'Revisa nuestros cifrados.',
}

export default function SongsPage() {
    return (
        <main className="page-container">
            <div className="editor-header">
                <h1>Canciones</h1>
                <div className="header-actions">
                    <ImportSongButton />
                    <Link href="/songs/new" className="primary-btn">Nueva canción</Link>
                </div>
            </div>
            <Suspense fallback={<p>Cargando canciones…</p>}>
                <SongList />
            </Suspense>
        </main>
    );
}

async function SongList() {
    const songs = await listSongs();

    if (songs.length === 0) {
        return <p className="empty-state">Aún no hay canciones guardadas.</p>;
    }

    return (
        <ul className="song-list">
            {songs.map((song) => (
                <li key={song.id}>
                    <Link href={`/songs/${song.id}`} className="song-item">
                        {song.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={song.imageUrl} alt="" className="song-cover" loading="lazy" />
                        ) : (
                            <span className="song-cover song-cover-empty" aria-hidden="true">♪</span>
                        )}
                        <span className="song-info">
                            <span className="song-title">{song.title || 'Sin título'}</span>
                            <span className="song-artist">{song.artist || 'Artista desconocido'}</span>
                        </span>
                        <span className="song-meta">
                            <span className="song-key">{song.key}</span>
                            <span className="song-tag">{song.tempo} BPM</span>
                            <span className="song-tag">{song.compas}</span>
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}