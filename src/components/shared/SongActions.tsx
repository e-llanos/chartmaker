'use client';

import Link from 'next/link';
import { songEditPath, type SongView } from '@/lib/songRoutes';
import DeleteSongButton from './DeleteSongButton';

const LABELS: Record<SongView, string> = {
    cifrado: 'Editar cifrado',
    chart: 'Editar chart',
    advanced: 'Editar chart avanzado',
};

interface SongActionsProps {
    id: string;
    title: string;
    view: SongView;
}

export default function SongActions({ id, title, view }: SongActionsProps) {
    const label = LABELS[view];
    return (
        <>
            <Link href={songEditPath(id, view)} className="icon-btn" aria-label={label} title={label}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
            </Link>
            <DeleteSongButton id={id} title={title} />
        </>
    );
}