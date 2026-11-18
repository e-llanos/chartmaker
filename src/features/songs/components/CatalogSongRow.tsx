import Link from 'next/link';
import type { ReactNode } from 'react';
import { LuFileText, LuLayoutGrid } from 'react-icons/lu';
import { albumHref, artistHref, type SongListItem } from '@/domain/song/query';
import SongCover from './SongCover';

/** Enlace si existe el registro (artista o álbum); si no, solo el texto. */
function MetaLink({ href, children }: { href?: string; children: ReactNode }) {
    return href ? <Link href={href} className="meta-link">{children}</Link> : <>{children}</>;
}

interface CatalogSongRowProps {
    song: SongListItem;
    /** Álbum, tonalidad, tempo y recursos a la derecha (en el listado completo). */
    showMeta?: boolean;
}

export default function CatalogSongRow({ song, showMeta = true }: CatalogSongRowProps) {
    const artistLink = song.artistId ? artistHref(song.artistId) : undefined;
    const albumLink = song.albumId ? albumHref(song.albumId) : undefined;

    return (
        <div className="cat-row">
            <SongCover src={song.imageUrl} size={46} />
            <span className="cat-row-main">
                <Link href={`/songs/${song.id}`} className="cat-row-title">{song.title}</Link>
                <span className="cat-row-sub">
                    <MetaLink href={artistLink}>{song.artist || 'Artista desconocido'}</MetaLink>
                    {!showMeta && song.album && (
                        <>
                            {' · '}
                            <MetaLink href={albumLink}>{song.album}</MetaLink>
                        </>
                    )}
                </span>
            </span>
            {showMeta && (
                <>
                    <span className="cat-row-album">
                        <MetaLink href={albumLink}>{song.album}</MetaLink>
                    </span>
                    <span className="cat-row-meta">
                        <span className="key-chip">{song.key}</span>
                        <span className="cat-row-tempo">{song.tempo} BPM</span>
                        <LuFileText size={18} title="Tiene cifrado" />
                        <LuLayoutGrid
                            size={18}
                            className={song.hasChart ? undefined : 'is-off'}
                            title={song.hasChart ? 'Tiene chart' : 'Sin chart'}
                        />
                    </span>
                </>
            )}
        </div>
    );
}