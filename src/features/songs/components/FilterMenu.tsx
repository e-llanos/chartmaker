import Link from 'next/link';
import { LuListFilter } from 'react-icons/lu';
import { SONG_KEYS } from '@/domain/music/core/key';
import { songsHref, songsParams, type SongQuery, type SortDefaults } from '@/domain/song/query';
import PopMenu from './PopMenu';

interface FilterMenuProps {
    query: SongQuery;
    defaults: SortDefaults;
}

export default function FilterMenu({ query, defaults }: FilterMenuProps) {
    const active = (query.key ? 1 : 0) + (query.withChart ? 1 : 0);
    // Lo demás (búsqueda, vista, orden, artista, álbum) viaja como campos ocultos.
    const keep = Object.fromEntries(songsParams({ ...query, key: '', withChart: false }, {}, defaults));

    return (
        <PopMenu
            label={
                <>
                    <LuListFilter size={16} aria-hidden="true" />
                    Filtros
                    {active > 0 && <span className="count-badge">{active}</span>}
                </>
            }
        >
            <form className="lib-pop-form" action="/songs" method="get">
                {Object.entries(keep).map(([name, value]) => (
                    <input key={name} type="hidden" name={name} value={value} />
                ))}
                <label className="lib-pop-field">
                    <span>Tonalidad</span>
                    <select name="key" defaultValue={query.key}>
                        <option value="">Todas</option>
                        {SONG_KEYS.map((k) => (
                            <option key={k} value={k}>{k}</option>
                        ))}
                    </select>
                </label>
                <label className="lib-pop-check">
                    <input type="checkbox" name="chart" value="1" defaultChecked={query.withChart} />
                    Solo con chart
                </label>
                <div className="lib-pop-actions">
                    <button type="submit" className="primary-btn">Aplicar</button>
                    <Link href={songsHref(query, { key: '', withChart: false }, defaults)} className="lib-pop-clear">
                        Limpiar
                    </Link>
                </div>
            </form>
        </PopMenu>
    );
}