import Link from 'next/link';
import { LuListFilter } from 'react-icons/lu';
import { songsHref, songsParams, type SongQuery, type SortDefaults } from '@/domain/song/query';
import FilterFields from './FilterFields';
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
            iconLabel="Filtros"
            label={
                <>
                    <LuListFilter size={18} aria-hidden="true" />
                    {active > 0 && <span className="count-badge">{active}</span>}
                </>
            }
        >
            <form className="lib-pop-form" action="/songs" method="get">
                {Object.entries(keep).map(([name, value]) => (
                    <input key={name} type="hidden" name={name} value={value} />
                ))}
                {/* key: si "Limpiar" cambia la consulta, los campos se reinician */}
                <FilterFields
                    key={`${query.key}|${query.withChart}`}
                    initialKey={query.key}
                    initialChart={query.withChart}
                />
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