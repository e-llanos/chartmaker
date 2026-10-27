/**
 * Separa un acorde para mostrar las extensiones en superíndice:
 *  "Fsus2" -> { base:'F', sup:'sus2' }   "Am7" -> { base:'Am', sup:'7' }
 *  "D/F#"  -> { base:'D', sup:'', bass:'/F#' }   "6m7" -> { base:'6m', sup:'7' }
 *  "Fasus2" -> { base:'Fa', sup:'sus2' } "Mim7" -> { base:'Mim', sup:'7' }  (latino)
 */

export interface SplitChord {
    base: string;
    sup: string;
    bass: string;
}

const ROOT = /^([#b]?[1-7]|[A-G][#b]?|[#b]?[ivIV]+)(m(?!aj))?([^/]*)$/;

/** Notación latina. `Fa(?!dd)` evita confundir el americano "Fadd9" con "Fa" + "dd9". */
const LATIN_ROOT = /^(Do|Re|Mi|Fa(?!dd)|Sol|La|Si)([#b]?)(m(?!aj))?([^/]*)$/;

export function splitChord(chord: string): SplitChord {
    const [main = '', ...bassParts] = String(chord).split('/');
    const bass = bassParts.length ? `/${bassParts.join('/')}` : '';

    const latin = main.match(LATIN_ROOT);
    if (latin) {
        return {
            base: (latin[1] ?? '') + (latin[2] ?? '') + (latin[3] ?? ''),
            sup: latin[4] ?? '',
            bass,
        };
    }

    const m = main.match(ROOT);
    if (!m) return { base: String(chord), sup: '', bass: '' };
    return {
        base: (m[1] ?? '') + (m[2] ?? ''),
        sup: m[3] ?? '',
        bass,
    };
}