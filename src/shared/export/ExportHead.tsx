import type { KeyReference } from '@/domain/music/core/analysis';
import { parseKey, relativeKey } from '@/domain/music/core/key';
import type { SongInput } from '@/domain/song/types';
import { formatKeyLabel, type Notation } from '@/domain/music/engine';

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

    const items = [`Tono: ${formatKeyLabel(displayKey, notation)}`];
    if (displayKey !== song.key) items.push(`Original: ${formatKeyLabel(song.key, notation)}`);
    items.push(`Tempo: ${song.tempo} BPM`, `Compás: ${song.compas}`);

    // Quien lee la hoja necesita saber desde dónde se numeró cuando no es la tónica.
    const key = parseKey(displayKey);
    const relative = key?.mode === 'minor' ? relativeKey(key) : null;
    if ((notation === 'nashville' || notation === 'roman') && reference === 'relativeMajor' && relative) {
        items.push(`Numeración desde ${formatKeyLabel(relative.tonic, 'symbol')} (relativa mayor)`);
    }

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