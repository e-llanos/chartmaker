import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { listSongs } from '@/lib/data/songs';

export const metadata: Metadata = {
    title: 'Charts',
    description: 'Elige nuestros charts.',
}

export default function ChartsPage() {
    return (
        <main className="page-container">
            <div className="editor-header">
                <h1>Charts</h1>
            </div>
            <p className="hint chart-intro">Cada chart pertenece a una canción. Elige una para verlo o crearlo.</p>
            <Suspense fallback={<p>Cargando charts…</p>}>
                <ChartList />
            </Suspense>
        </main>
    );
}

async function ChartList() {
    const songs = await listSongs();
    if (songs.length === 0) {
        return <p className="empty-state">Aún no hay canciones. Crea una desde Cifrados.</p>;
    }
    return (
        <ul className="song-list">
            {songs.map((song) => (
                <li key={song.id}>
                    <Link href={`/charts/${song.id}`} className="song-item">
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
                            <span className={`song-tag${song.hasChart ? '' : ' muted'}`}>
                                {song.hasChart ? 'Chart' : 'Sin chart'}
                            </span>
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}