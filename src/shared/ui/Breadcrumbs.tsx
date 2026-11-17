import Link from 'next/link';
import type { ReactNode } from 'react';
import { LuChevronRight } from 'react-icons/lu';

export interface Crumb {
    label: string;
    /** Sin enlace, o el último elemento, es la página actual. */
    href?: string;
}

interface BreadcrumbsProps {
    items: readonly Crumb[];
    /** Algo a la izquierda de la ruta (por ejemplo, el botón que contrae un panel). */
    leading?: ReactNode;
}

export default function Breadcrumbs({ items, leading }: BreadcrumbsProps) {
    return (
        <div className="crumbs-bar">
            {leading}
            <nav className="crumbs" aria-label="Ruta de navegación">
                <ol>
                    {items.map((item, i) => {
                        const last = i === items.length - 1;
                        return (
                            <li key={`${i}-${item.label}`}>
                                {i > 0 && <LuChevronRight size={14} aria-hidden="true" />}
                                {item.href && !last ? (
                                    <Link href={item.href}>{item.label}</Link>
                                ) : (
                                    <span aria-current={last ? 'page' : undefined}>{item.label}</span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
}