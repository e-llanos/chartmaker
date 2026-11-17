import Link from 'next/link';
import type { CSSProperties } from 'react';
import { initialsOf } from '@/shared/ui/initials';

/** Un color estable por artista, para que cada círculo sea reconocible. */
function hueOf(name: string): number {
    let hue = 0;
    for (const ch of name) hue = (hue * 31 + ch.charCodeAt(0)) % 360;
    return hue;
}

interface ArtistAvatarProps {
    name: string;
    songs: number;
    href: string;
    imageUrl?: string;
}

export default function ArtistAvatar({ name, songs, href, imageUrl }: ArtistAvatarProps) {
    return (
        <Link href={href} className="artist-card">
            {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="artist-avatar" src={imageUrl} alt="" loading="lazy" />
            ) : (
                <span className="artist-avatar" style={{ '--hue': hueOf(name) } as CSSProperties} aria-hidden="true">
                    {initialsOf(name)}
                </span>
            )}
            <strong>{name}</strong>
            <span>{songs} {songs === 1 ? 'canción' : 'canciones'}</span>
        </Link>
    );
}