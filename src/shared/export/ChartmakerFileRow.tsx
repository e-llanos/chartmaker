'use client';

import { LuFileMusic } from 'react-icons/lu';
import { CHARTMAKER_EXT, serializeChartmaker } from '@/domain/song/chartmaker';
import type { SongCreate } from '@/domain/song/types';
import { downloadText, safeFilename } from '@/shared/export/export-sheet';

/** Fila de preferencias que descarga la canción como archivo .chartmaker. */
export default function ChartmakerFileRow({ song }: { song: SongCreate }) {
    return (
        <button
            type="button"
            className="pref-row pref-action"
            onClick={(e) => {
                downloadText(serializeChartmaker(song), `${safeFilename(song.title)}${CHARTMAKER_EXT}`);
                e.currentTarget.closest('dialog')?.close();
            }}
        >
            <span className="pref-label">
                <LuFileMusic size={18} aria-hidden="true" />
                Archivo chartmaker
            </span>
            <small>{CHARTMAKER_EXT}</small>
        </button>
    );
}