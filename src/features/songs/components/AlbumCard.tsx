import Link from 'next/link';
import SongCover from './SongCover';

interface AlbumCardProps {
    title: string;
    artistName?: string;
    imageUrl?: string;
    songs: number;
    href: string;
}

export default function AlbumCard({ title, artistName, imageUrl, songs, href }: AlbumCardProps) {
    return (
        <Link href={href} className="album-card">
            <SongCover src={imageUrl} size={160} />
            <strong>{title}</strong>
            <span>{artistName ?? 'Varios artistas'} · {songs} {songs === 1 ? 'canción' : 'canciones'}</span>
        </Link>
    );
}