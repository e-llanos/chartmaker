/**
 * Separa un acorde para mostrar las extensiones en superíndice:
 *  "Fsus2" -> { base:'F', sup:'sus2' }   "Am7" -> { base:'Am', sup:'7' }
 *  "D/F#"  -> { base:'D', sup:'', bass:'/F#' }   "6m7" -> { base:'6m', sup:'7' }
 *  "Fasus2" -> { base:'Fa', sup:'sus2' } "Mim7" -> { base:'Mim', sup:'7' }  (latino)
 * Los acordes con nota (americana o latina) se separan con `core`; aquí solo se reconocen
 * los números Nashville y romanos.
 */
import { splitNoteChord } from '@/domain/music/core/notation';

export interface SplitChord {
    base: string;
    sup: string;
    bass: string;
}

const NUMERAL_ROOT = /^([#b]?[1-7]|[#b]?[ivIV]+)(m(?!aj))?([^/]*)$/;

export function splitChord(chord: string): SplitChord {
    const [main = '', ...bassParts] = String(chord).split('/');
    const bass = bassParts.length ? `/${bassParts.join('/')}` : '';

    const note = splitNoteChord(main);
    if (note) return { ...note, bass };

    const m = main.match(NUMERAL_ROOT);
    if (!m) return { base: String(chord), sup: '', bass: '' };
    return { base: (m[1] ?? '') + (m[2] ?? ''), sup: m[3] ?? '', bass };
}
