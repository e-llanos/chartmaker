import type { ReactNode } from 'react';
import { LuClock, LuTimer, LuUser } from 'react-icons/lu';
import type { SongInput } from '@/domain/song/types';

export type SongMeta = Pick<SongInput, 'artist' | 'album' | 'imageUrl' | 'tempo' | 'compas'>;

interface SongHeaderProps {
    title: string;
    meta: SongMeta;
    editHref?: string;
    deleteId?: string;
    actions?: ReactNode;
}

export default function SongHeader({ title, meta, actions }: SongHeaderProps) {
    const { artist, album, tempo, compas } = meta;
    return (
        <header className="song-header">
            <h1 className="song-header-title">{title || 'Sin título'}</h1>
            {actions && <div className="song-header-tools">{actions}</div>}
            <ul className="song-header-meta">
                <li><LuTimer size={14} aria-hidden="true" />{tempo} BPM</li>
                <li><LuClock size={14} aria-hidden="true" />{compas}</li>
                <li>
                    <LuUser size={14} aria-hidden="true" />
                    {artist || 'Artista desconocido'}
                    {album ? <span className="song-header-album"> · {album}</span> : null}
                </li>
            </ul>
        </header>
    );
}