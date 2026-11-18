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
import PopMenu from './PopMenu';

interface SortMenuProps {
    query: SongQuery;
    defaults: SortDefaults;
    sorts: readonly SongSort[];
}

export default function SortMenu({ query, defaults, sorts }: SortMenuProps) {
    const DirectionIcon = query.dir === 'asc' ? LuArrowDownAZ : LuArrowUpAZ;
    return (
        <>
            <PopMenu
                alignEnd
                variant="menu"
                label={
                    <>
                        <LuArrowUpDown size={16} aria-hidden="true" />
                        {SORT_LABELS[query.sort]}
                        <LuChevronDown size={14} aria-hidden="true" />
                    </>
                }
            >
                {sorts.map((sort) => (
                    <Link
                        key={sort}
                        href={songsHref(query, { sort }, defaults)}
                        className="lib-pop-item"
                        aria-current={sort === query.sort ? 'true' : undefined}
                    >
                        {SORT_LABELS[sort]}
                    </Link>
                ))}
            </PopMenu>
            <Link
                href={songsHref(query, { dir: query.dir === 'asc' ? 'desc' : 'asc' }, defaults)}
                className="lib-tool-btn"
                aria-label="Invertir el orden"
            >
                <DirectionIcon size={16} aria-hidden="true" />
                {directionLabel(query.sort, query.dir)}
            </Link>
        </>
    );
}