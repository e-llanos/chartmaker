import Link from 'next/link';
import { LuPencil } from 'react-icons/lu';
import { songEditPath } from '@/config/routes';
import { albumHref, artistHref, type SongListItem } from '@/domain/song/query';
import { timeAgo } from '@/shared/ui/relative-time';
import FavoriteButton from './FavoriteButton';
import SongCover from './SongCover';

interface SongsTableProps {
    songs: SongListItem[];
    canEdit: boolean;
    favoriteAction: (formData: FormData) => void | Promise<void>;
}

export default function SongsTable({ songs, canEdit, favoriteAction }: SongsTableProps) {
    return (
        <div className="lib-table-wrap">
            <table className="lib-table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th className="col-artist">Artista</th>
                        <th className="col-album">Álbum</th>
                        <th className="col-key">Tonal.</th>
                        <th className="col-tempo">Tempo</th>
                        <th className="col-date">Modificada</th>
                        <th><span className="sr-only">Acciones</span></th>
                    </tr>
                </thead>
                <tbody>
                    {songs.map((song) => (
                        <tr key={song.id}>
                            <td>
                                <Link href={`/songs/${song.id}`} className="lib-title">
                                    <SongCover src={song.imageUrl} size={36} />
                                    <span className="lib-title-text">
                                        <span className="lib-title-name">
                                            {song.title}
                                            {song.hasChart && (
                                                <span className="mini-tag">
                                                    {song.chartStyle === 'advanced' ? 'Avanzado' : 'Chart'}
                                                </span>
                                            )}
                                        </span>
                                        {song.artist && <span className="lib-title-artist">{song.artist}</span>}
                                    </span>
                                </Link>
                            </td>
                            <td className="col-artist">
                                {song.artistId ? (
                                    <Link href={artistHref(song.artistId)} className="meta-link">{song.artist}</Link>
                                ) : (
                                    song.artist
                                )}
                            </td>
                            <td className="col-album">
                                {song.albumId ? (
                                    <Link href={albumHref(song.albumId)} className="meta-link">{song.album}</Link>
                                ) : (
                                    song.album
                                )}
                            </td>
                            <td className="col-key"><span className="key-chip">{song.key}</span></td>
                            <td className="col-tempo">{song.tempo}</td>
                            <td className="col-date">{timeAgo(song.updatedAt)}</td>
                            <td className="col-actions">
                                <FavoriteButton songId={song.id} isFavorite={song.isFavorite} action={favoriteAction} />
                                {canEdit && (
                                    <Link
                                        href={songEditPath(song.id, 'cifrado')}
                                        className="icon-btn"
                                        aria-label={`Editar ${song.title}`}
                                        title="Editar"
                                    >
                                        <LuPencil size={16} aria-hidden="true" />
                                    </Link>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}