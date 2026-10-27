import type { SongInput } from '@/lib/data/song.types';
import { formatKeyLabel, type Notation } from '@/lib/music/engine';

type HeadSong = Pick<SongInput, 'title' | 'artist' | 'album' | 'key' | 'tempo' | 'compas'>;

interface ExportHeadProps {
    song: HeadSong;
    /** Tonalidad mostrada (ya transpuesta). */
    displayKey: string;
    notation: Notation;
}

/** Cabecera de la hoja exportada: TÍTULO - ARTISTA | ÁLBUM y línea de datos. */
export default function ExportHead({ song, displayKey, notation }: ExportHeadProps) {
    const heading =
        [song.title || 'Sin título', song.artist].filter(Boolean).join(' - ');

    const items = [`Tono: ${formatKeyLabel(displayKey, notation)}`];
    if (displayKey !== song.key) items.push(`Original: ${formatKeyLabel(song.key, notation)}`);
    items.push(`Tempo: ${song.tempo} BPM`, `Compás: ${song.compas}`);

    return (
        <div className="export-only export-head" data-export-block>
            <h1>{heading}</h1>
            <p>
                {items.map((item, i) => (
                    <span key={item}>
                        {i > 0 && <span className="export-sep">|</span>}
                        {item}
                    </span>
                ))}
            </p>
        </div>
    );
}