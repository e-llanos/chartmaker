import type { CSSProperties } from 'react';
import { LuMusic } from 'react-icons/lu';

interface SongCoverProps {
    src?: string;
    size?: number;
}

export default function SongCover({ src, size = 44 }: SongCoverProps) {
    const style = { '--size': `${size}px` } as CSSProperties;
    if (!src) {
        return (
            <span className="song-cover is-empty" style={style} aria-hidden="true">
                <LuMusic size={Math.round(size * 0.45)} />
            </span>
        );
    }
    // La portada puede ser una URL externa cualquiera: se usa <img> y no next/image.
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="song-cover" style={style} src={src} alt="" loading="lazy" />;
}