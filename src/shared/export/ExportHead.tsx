import type { KeyReference } from '@/domain/music/core/analysis';
import type { SongInput } from '@/domain/song/types';
import { type Notation } from '@/domain/music/notation/engine';
import { exportMetaItems } from './export-meta';

type HeadSong = Pick<SongInput, 'title' | 'artist' | 'album' | 'key' | 'tempo' | 'compas'>;

interface ExportHeadProps {
    song: HeadSong;
    /** Tonalidad mostrada (ya transpuesta). */
    displayKey: string;
    notation: Notation;
    /** Desde dónde se numeran los acordes (Nashville y romanos). */
    reference?: KeyReference;
}

/** Cabecera de la hoja exportada: TÍTULO - ARTISTA | ÁLBUM y línea de datos. */
export default function ExportHead({ song, displayKey, notation, reference }: ExportHeadProps) {
    const heading =
        [song.title || 'Sin título', song.artist].filter(Boolean).join(' - ');

    const items = exportMetaItems(song, displayKey, notation, reference);

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