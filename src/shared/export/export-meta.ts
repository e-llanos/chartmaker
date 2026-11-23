import type { KeyReference } from '@/domain/music/core/analysis';
import { parseKey, relativeKey } from '@/domain/music/core/key';
import type { SongInput } from '@/domain/song/types';
import { formatKeyLabel, type Notation } from '@/domain/music/notation/engine';

type HeadSong = Pick<SongInput, 'title' | 'artist' | 'album' | 'key' | 'tempo' | 'compas'>;

/** Línea de datos de la hoja exportada: Tono, Original, Tempo, Compás… */
export function exportMetaItems(
    song: HeadSong, displayKey: string, notation: Notation, reference?: KeyReference
): string[] {
    const items = [`Tono: ${formatKeyLabel(displayKey, notation)}`];
    if (displayKey !== song.key) items.push(`Original: ${formatKeyLabel(song.key, notation)}`);
    items.push(`Tempo: ${song.tempo} BPM`, `Compás: ${song.compas}`);

    const key = parseKey(displayKey);
    const relative = key?.mode === 'minor' ? relativeKey(key) : null;
    if ((notation === 'nashville' || notation === 'roman') && reference === 'relativeMajor' && relative) {
        items.push(`Numeración desde ${formatKeyLabel(relative.tonic, 'symbol')} (relativa mayor)`);
    }
    return items;
}