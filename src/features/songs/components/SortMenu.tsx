import Link from 'next/link';
import { LuArrowDownAZ, LuArrowUpAZ, LuArrowUpDown, LuChevronDown } from 'react-icons/lu';
import {
    SORT_LABELS,
    directionLabel,
    songsHref,
    type SongQuery,
    type SongSort,
    type SortDefaults,
} from '@/domain/song/query';

interface SortMenuProps {
    query: SongQuery;
    defaults: SortDefaults;
    sorts: readonly SongSort[];
}

export default function SortMenu({ query, defaults, sorts }: SortMenuProps) {
    const DirectionIcon = query.dir === 'asc' ? LuArrowDownAZ : LuArrowUpAZ;
    return (
        <div className="tool-group">
            <details className="pop">
                <summary className="tool-btn">
                    <LuArrowUpDown size={16} aria-hidden="true" />
                    {SORT_LABELS[query.sort]}
                    <LuChevronDown size={14} aria-hidden="true" />
                </summary>
                <div className="pop-panel is-menu">
                    {sorts.map((sort) => (
                        <Link
                            key={sort}
                            href={songsHref(query, { sort }, defaults)}
                            className="pop-item"
                            aria-current={sort === query.sort ? 'true' : undefined}
                        >
                            {SORT_LABELS[sort]}
                        </Link>
                    ))}
                </div>
            </details>
            <Link
                href={songsHref(query, { dir: query.dir === 'asc' ? 'desc' : 'asc' }, defaults)}
                className="tool-btn"
                aria-label="Invertir el orden"
            >
                <DirectionIcon size={16} aria-hidden="true" />
                {directionLabel(query.sort, query.dir)}
            </Link>
        </div>
    );
}