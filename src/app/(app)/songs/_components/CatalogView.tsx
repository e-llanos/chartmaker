import Link from 'next/link';
import {
    CATALOG_TAB_LABELS,
    CATALOG_TABS,
    songsHref,
    songsParams,
    type ArtistSummary,
    type SongQuery,
    type SongSort,
    type SortDefaults,
} from '@/domain/song/query';
import AlbumCard from '@/features/songs/components/AlbumCard';
import ArtistAvatar from '@/features/songs/components/ArtistAvatar';
import CatalogSongRow from '@/features/songs/components/CatalogSongRow';
import Pagination from '@/features/songs/components/Pagination';
import SearchBar from '@/features/songs/components/SearchBar';
import SortMenu from '@/features/songs/components/SortMenu';
import { getAlbumInfo, getArtistName, listAlbums, listArtists, searchSongs } from '@/server/songs/catalog';

export const CATALOG_DEFAULTS: SortDefaults = { sort: 'created' };
const CATALOG_SORTS: readonly SongSort[] = ['created', 'title', 'artist'];

export default async function CatalogView({ query }: { query: SongQuery }) {
    const isHome = query.tab === 'all' && !query.q && !query.artist && !query.album && query.page === 1;
    const keep = Object.fromEntries(songsParams({ ...query, q: '' }, {}, CATALOG_DEFAULTS));

    return (
        <div className="cat-page">
            <h1 className="sr-only">Canciones</h1>
            <SearchBar placeholder="Busca canciones, artistas o álbumes" defaultValue={query.q} keep={keep} />

            <nav className="chips" aria-label="Qué buscar">
                {CATALOG_TABS.map((tab) => (
                    <Link
                        key={tab}
                        href={songsHref(query, { tab, artist: '', album: '' }, CATALOG_DEFAULTS)}
                        className="chip"
                        aria-current={query.tab === tab ? 'page' : undefined}
                    >
                        {CATALOG_TAB_LABELS[tab]}
                    </Link>
                ))}
            </nav>

            {isHome ? (
                <CatalogHome query={query} />
            ) : query.tab === 'artists' ? (
                <ArtistsResults query={query} />
            ) : query.tab === 'albums' ? (
                <AlbumsResults query={query} />
            ) : (
                <SongResults query={query} />
            )}
        </div>
    );
}

function artistLink(query: SongQuery, artist: ArtistSummary): string {
    return songsHref(query, { tab: 'songs', artist: artist.id, album: '', q: '' }, CATALOG_DEFAULTS);
}

async function CatalogHome({ query }: { query: SongQuery }) {
    const [recent, albums, artists] = await Promise.all([
        searchSongs({ ...query, sort: 'created', dir: 'desc' }, { pageSize: 6 }),
        listAlbums({ limit: 7 }),
        listArtists({ limit: 14 }),
    ]);

    if (recent.total === 0) return <p className="cat-empty">Aún no hay canciones en el catálogo.</p>;

    return (
        <>
            <section className="cat-section">
                <header>
                    <h2>Añadidas recientemente</h2>
                    <Link href={songsHref(query, { tab: 'songs' }, CATALOG_DEFAULTS)}>Ver todo</Link>
                </header>
                <div className="cat-grid">
                    {recent.items.map((song) => (
                        <CatalogSongRow key={song.id} song={song} showMeta={false} />
                    ))}
                </div>
            </section>

            {albums.length > 0 && (
                <section className="cat-section">
                    <header>
                        <h2>Álbumes</h2>
                        <Link href={songsHref(query, { tab: 'albums' }, CATALOG_DEFAULTS)}>Ver todo</Link>
                    </header>
                    <div className="cat-albums">
                        {albums.map((album) => (
                            <AlbumCard
                                key={album.id}
                                title={album.title}
                                artistName={album.artistName}
                                imageUrl={album.imageUrl}
                                songs={album.songs}
                                href={songsHref(query, { tab: 'songs', album: album.id, artist: '', q: '' }, CATALOG_DEFAULTS)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {artists.length > 0 && (
                <section className="cat-section">
                    <header>
                        <h2>Artistas</h2>
                        <Link href={songsHref(query, { tab: 'artists' }, CATALOG_DEFAULTS)}>Ver todo</Link>
                    </header>
                    <div className="cat-artists">
                        {artists.map((artist) => (
                            <ArtistAvatar
                                key={artist.id}
                                name={artist.name}
                                songs={artist.songs}
                                imageUrl={artist.imageUrl}
                                href={artistLink(query, artist)}
                            />
                        ))}
                    </div>
                </section>
            )}

            <div className="cat-more">
                <Link href={songsHref(query, { tab: 'songs' }, CATALOG_DEFAULTS)} className="primary-btn">
                    Ver las {recent.total} canciones
                </Link>
            </div>
        </>
    );
}

async function ArtistsResults({ query }: { query: SongQuery }) {
    const artists = await listArtists({ q: query.q, limit: 60 });
    if (artists.length === 0) return <p className="cat-empty">No encontramos artistas con ese nombre.</p>;

    return (
        <section className="cat-section">
            <p className="cat-count">({artists.length} {artists.length === 1 ? 'artista' : 'artistas'})</p>
            <div className="cat-artists">
                {artists.map((artist) => (
                    <ArtistAvatar
                        key={artist.id}
                        name={artist.name}
                        songs={artist.songs}
                        imageUrl={artist.imageUrl}
                        href={artistLink(query, artist)}
                    />
                ))}
            </div>
        </section>
    );
}

async function AlbumsResults({ query }: { query: SongQuery }) {
    const albums = await listAlbums({ q: query.q, limit: 60 });
    if (albums.length === 0) return <p className="cat-empty">No encontramos álbumes con ese nombre.</p>;

    return (
        <section className="cat-section">
            <p className="cat-count">({albums.length} {albums.length === 1 ? 'álbum' : 'álbumes'})</p>
            <div className="cat-albums">
                {albums.map((album) => (
                    <AlbumCard
                        key={album.id}
                        title={album.title}
                        artistName={album.artistName}
                        imageUrl={album.imageUrl}
                        songs={album.songs}
                        href={songsHref(query, { tab: 'songs', album: album.id, artist: '', q: '' }, CATALOG_DEFAULTS)}
                    />
                ))}
            </div>
        </section>
    );
}

async function SongResults({ query }: { query: SongQuery }) {
    const [page, artistMatches, artistName, albumInfo] = await Promise.all([
        searchSongs(query),
        query.tab === 'all' && query.q ? listArtists({ q: query.q, limit: 7 }) : Promise.resolve<ArtistSummary[]>([]),
        query.artist ? getArtistName(query.artist) : Promise.resolve(null),
        query.album ? getAlbumInfo(query.album) : Promise.resolve(null),
    ]);
    const sorts = query.q ? (['relevance', ...CATALOG_SORTS] as const) : CATALOG_SORTS;

    return (
        <section className="cat-section">
            {artistMatches.length > 0 && (
                <div className="cat-artists is-strip">
                    {artistMatches.map((artist) => (
                        <ArtistAvatar
                            key={artist.id}
                            name={artist.name}
                            songs={artist.songs}
                            imageUrl={artist.imageUrl}
                            href={artistLink(query, artist)}
                        />
                    ))}
                </div>
            )}

            <div className="cat-results-head">
                <p className="cat-count">
                    ({page.total} {page.total === 1 ? 'resultado' : 'resultados'})
                    {artistName && <> de <strong>{artistName}</strong></>}
                    {albumInfo && <> en <strong>{albumInfo.title}</strong></>}
                    {(artistName || albumInfo) && (
                        <>
                            {' · '}
                            <Link href={songsHref(query, { artist: '', album: '' }, CATALOG_DEFAULTS)}>Quitar</Link>
                        </>
                    )}
                </p>
                <div className="lib-tools">
                    <SortMenu query={query} defaults={CATALOG_DEFAULTS} sorts={sorts} />
                </div>
            </div>

            {page.items.length === 0 ? (
                <p className="cat-empty">No encontramos canciones con esa búsqueda.</p>
            ) : (
                <>
                    <div className="cat-list">
                        {page.items.map((song) => (
                            <CatalogSongRow key={song.id} song={song} />
                        ))}
                    </div>
                    <Pagination
                        page={page.page}
                        pageCount={page.pageCount}
                        hrefFor={(p) => songsHref(query, { page: p }, CATALOG_DEFAULTS)}
                    />
                </>
            )}
        </section>
    );
}