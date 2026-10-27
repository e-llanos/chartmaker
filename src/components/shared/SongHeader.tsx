import Link from 'next/link';
import type { SongInput } from '@/lib/data/song.types';
import DeleteSongButton from './DeleteSongButton';

export type SongMeta = Pick<SongInput, 'artist' | 'album' | 'imageUrl' | 'tempo' | 'compas'>;

interface SongHeaderProps {
    title: string;
    meta: SongMeta;
    editHref?: string;
    deleteId?: string;
}

export default function SongHeader({ title, meta, editHref, deleteId }: SongHeaderProps) {
    const { artist, album, imageUrl, tempo, compas } = meta;
    return (
        <header className="song-header">
            {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="song-header-cover" />
            ) : (
                <span className="song-header-cover song-cover-empty" aria-hidden="true">♪</span>
            )}
            <div className="song-header-info">
                <h1>{title || 'Sin título'}</h1>
                <p className="song-header-artist">{artist || 'Artista desconocido'}</p>
                {album && <p className="song-header-album">{album}</p>}
                <div className="song-header-tags">
                    <span className="song-tag">{tempo} BPM</span>
                    <span className="song-tag">{compas}</span>
                </div>
            </div>
            {(editHref || deleteId) && (
                <div className="song-header-actions">
                    {editHref && (
                        <Link href={editHref} className="icon-btn"
                            aria-label="Editar canción" title="Editar canción">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                        </Link>
                    )}
                    {deleteId && <DeleteSongButton id={deleteId} title={title} />}
                </div>
            )}
        </header>
    );
}