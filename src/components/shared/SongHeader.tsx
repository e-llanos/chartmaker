import Link from 'next/link';
import type { ReactNode } from 'react';
import type { SongInput } from '@/domain/song/types';
import DeleteSongButton from './DeleteSongButton';

export type SongMeta = Pick<SongInput, 'artist' | 'album' | 'imageUrl' | 'tempo' | 'compas'>;

interface SongHeaderProps {
    title: string;
    meta: SongMeta;
    editHref?: string;
    deleteId?: string;
    actions?: ReactNode;
}

export default function SongHeader({ title, meta, actions }: SongHeaderProps) {
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
            {actions && <div className="song-header-actions">{actions}</div>}
        </header>
    );
}