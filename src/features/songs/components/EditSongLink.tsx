'use client';

import Link from 'next/link';
import { LuPencil } from 'react-icons/lu';
import { songEditPath, type SongView } from '@/config/routes';
import { SONG_FORMATS } from '@/features/songs/formats';

interface EditSongLinkProps {
    id: string;
    view: SongView;
    /** button: botón con texto en la cabecera. row: fila de las preferencias. */
    variant?: 'button' | 'row';
}

export default function EditSongLink({ id, view, variant = 'button' }: EditSongLinkProps) {
    const label = SONG_FORMATS[view].editLabel;
    const href = songEditPath(id, view);

    if (variant === 'row') {
        return (
            <Link href={href} className="pref-row pref-action">
                <span className="pref-label">
                    <LuPencil size={18} aria-hidden="true" />
                    {label}
                </span>
            </Link>
        );
    }

    return (
        <Link href={href} className="edit-btn" aria-label={label} title={label}>
            <LuPencil size={16} aria-hidden="true" />
            <span>Editar</span>
        </Link>
    );
}