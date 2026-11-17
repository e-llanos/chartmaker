import Link from 'next/link';
import { LuPlus, LuX } from 'react-icons/lu';
import { can } from '@/domain/auth/roles';
import { SONG_SORTS, songsHref, songsParams, type SongQuery, type SortDefaults } from '@/domain/song/query';
import FilterMenu from '@/features/songs/components/FilterMenu';
import ImportSongButton from '@/features/songs/components/ImportSongButton';
import Pagination from '@/features/songs/components/Pagination';
import SearchBar from '@/features/songs/components/SearchBar';
import SongsBreadcrumbs from '@/features/songs/components/SongsBreadcrumbs';
import SongsTable from '@/features/songs/components/SongsTable';
import SortMenu from '@/features/songs/components/SortMenu';
import type { CurrentUser } from '@/server/auth/session';
import { getAlbumInfo, getArtistName, searchSongs } from '@/server/songs/catalog';
import { toggleFavoriteAction } from '../actions';

export const LIBRARY_DEFAULTS: SortDefaults = { sort: 'title' };

export default async function LibraryView({ query, user }: { query: SongQuery; user: CurrentUser }) {
    const [page, artistName, albumInfo] = await Promise.all([
        searchSongs(query, { userId: user.id, includeLyrics: true }),
        query.artist ? getArtistName(query.artist) : Promise.resolve(null),
        query.album ? getAlbumInfo(query.album) : Promise.resolve(null),
    ]);

    const canCreate = can(user.role, 'song:create');
    const canEdit = can(user.role, 'song:update');
    const isSaved = query.view === 'saved';
    const title = isSaved ? 'Canciones guardadas' : 'Todas las canciones';
    const filtered = Boolean(query.q || query.key || query.withChart || query.artist || query.album);
    const keep = Object.fromEntries(songsParams({ ...query, q: '' }, {}, LIBRARY_DEFAULTS));
    // "Relevancia" solo tiene sentido cuando hay una búsqueda.
    const sorts = SONG_SORTS.filter((sort) => sort !== 'relevance' || query.q);

    return (
        <>
            <SongsBreadcrumbs items={[{ label: 'Canciones', href: '/songs' }, { label: title }]} />

            <header className="lib-head">
                <h1>
                    {title} <span className="count-badge">{page.total}</span>
                </h1>
                {canCreate && (
                    <div className="lib-actions">
                        <ImportSongButton />
                        <Link href="/songs/new" className="primary-btn">
                            <LuPlus size={16} aria-hidden="true" /> Nueva canción
                        </Link>
                    </div>
                )}
            </header>

            <div className="lib-panel">
                <div className="lib-toolbar">
                    <SearchBar variant="compact" placeholder="Buscar por título, artista o letra" defaultValue={query.q} keep={keep} />
                    <FilterMenu query={query} defaults={LIBRARY_DEFAULTS} />
                    <SortMenu query={query} defaults={LIBRARY_DEFAULTS} sorts={sorts} />
                </div>

                {(artistName || albumInfo) && (
                    <div className="active-filters">
                        {artistName && (
                            <Link href={songsHref(query, { artist: '' }, LIBRARY_DEFAULTS)} className="filter-chip" title="Quitar el filtro">
                                Artista: {artistName} <LuX size={14} aria-hidden="true" />
                            </Link>
                        )}
                        {albumInfo && (
                            <Link href={songsHref(query, { album: '' }, LIBRARY_DEFAULTS)} className="filter-chip" title="Quitar el filtro">
                                Álbum: {albumInfo.title} <LuX size={14} aria-hidden="true" />
                            </Link>
                        )}
                    </div>
                )}

                {page.items.length === 0 ? (
                    <div className="lib-empty">
                        {filtered ? (
                            <>
                                <h2>Sin resultados</h2>
                                <p>Ninguna canción coincide con la búsqueda o los filtros.</p>
                                <Link
                                    href={songsHref(query, { q: '', key: '', withChart: false, artist: '', album: '' }, LIBRARY_DEFAULTS)}
                                    className="primary-btn"
                                >
                                    Quitar filtros
                                </Link>
                            </>
                        ) : isSaved ? (
                            <>
                                <h2>Aún no guardaste canciones</h2>
                                <p>Pulsa el corazón de una canción para tenerla aquí.</p>
                            </>
                        ) : (
                            <>
                                <h2>Todavía no hay canciones</h2>
                                <p>{canCreate ? 'Crea la primera o importa un archivo .chartmaker.' : 'Cuando se añadan, aparecerán aquí.'}</p>
                                {canCreate && <Link href="/songs/new" className="primary-btn">Nueva canción</Link>}
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <SongsTable songs={page.items} canEdit={canEdit} favoriteAction={toggleFavoriteAction} />
                        <Pagination
                            page={page.page}
                            pageCount={page.pageCount}
                            hrefFor={(p) => songsHref(query, { page: p }, LIBRARY_DEFAULTS)}
                        />
                    </>
                )}
            </div>
        </>
    );
}