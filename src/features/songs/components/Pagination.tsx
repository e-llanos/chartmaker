import Link from 'next/link';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

interface PaginationProps {
    page: number;
    pageCount: number;
    hrefFor: (page: number) => string;
}

/** Primera, última y las vecinas de la actual, con "…" donde hay saltos. */
function pagesToShow(page: number, pageCount: number): Array<number | 'gap'> {
    const wanted = new Set([1, pageCount, page - 1, page, page + 1]);
    const sorted = [...wanted].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
    const out: Array<number | 'gap'> = [];
    sorted.forEach((p, i) => {
        const previous = sorted[i - 1];
        if (previous !== undefined && p - previous > 1) out.push('gap');
        out.push(p);
    });
    return out;
}

export default function Pagination({ page, pageCount, hrefFor }: PaginationProps) {
    if (pageCount <= 1) return null;

    return (
        <nav className="pagination" aria-label="Paginación">
            {page > 1 ? (
                <Link href={hrefFor(page - 1)} className="page-link" aria-label="Página anterior">
                    <LuChevronLeft size={16} aria-hidden="true" />
                </Link>
            ) : (
                <span className="page-link is-disabled" aria-hidden="true"><LuChevronLeft size={16} /></span>
            )}

            {pagesToShow(page, pageCount).map((p, i) =>
                p === 'gap' ? (
                    <span key={`gap-${i}`} className="page-gap">…</span>
                ) : (
                    <Link key={p} href={hrefFor(p)} className="page-link" aria-current={p === page ? 'page' : undefined}>
                        {p}
                    </Link>
                ),
            )}

            {page < pageCount ? (
                <Link href={hrefFor(page + 1)} className="page-link" aria-label="Página siguiente">
                    <LuChevronRight size={16} aria-hidden="true" />
                </Link>
            ) : (
                <span className="page-link is-disabled" aria-hidden="true"><LuChevronRight size={16} /></span>
            )}
        </nav>
    );
}