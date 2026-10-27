import { SECTION_TYPES, type SectionType } from '../sections/sectionTypes';

/**
 * Convierte texto ChordPro con secciones en una estructura lista para render:
 *
 *   {start_of_verse: Verso 1}
 *   {comment: Pad & Piano}        <- primera nota = anotación de la sección
 *   [Am]Letra con [C]acordes
 *   [Am] [F] [C]                  <- línea solo de acordes
 *   {end_of_verse}
 *
 * Devuelve [{ id, type, label, note, lines: [{tokens}|{comment}] }]
 */

export interface Token {
    chord: string | null;
    text: string;
}

export interface TokensLine {
    tokens: Token[];
}

export interface CommentLine {
    comment: string;
}

export type ParsedLine = TokensLine | CommentLine;

export interface ParsedSection {
    id: string;
    type: SectionType;
    label: string;
    note: string;
    repeat: number;
    lines: ParsedLine[];
}

const START = /^\{\s*start_of_(\w+)\s*(?::\s*(.*?))?\s*\}$/i;
const REPEAT = /^\{\s*repeat\s*:\s*(\d+)\s*\}$/i;
const END = /^\{\s*end_of_\w+\s*\}$/i;
const COMMENT = /^\{\s*(?:comment|c)\s*:\s*(.*?)\s*\}$/i;
const DIRECTIVE = /^\{.*\}$/;

/** Type guard: comprueba que un string sea un tipo de sección válido. */
function isSectionType(value: string): value is SectionType {
    return Object.prototype.hasOwnProperty.call(SECTION_TYPES, value);
}

/** "[Em]Tu [D]texto" -> [{chord:'Em', text:'Tu '}, {chord:'D', text:'texto'}] */
export function parseLine(line: string): Token[] {
    const re = /\[([^\]]+)\]/g;
    const tokens: Token[] = [];
    let last = 0;
    let pending: string | null = null;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
        const before = line.slice(last, m.index);
        if (before || pending !== null) tokens.push({ chord: pending, text: before });
        pending = m[1];
        last = re.lastIndex;
    }
    tokens.push({ chord: pending, text: line.slice(last) });
    return tokens;
}

export function parseSections(text: string = ''): ParsedSection[] {
    const sections: ParsedSection[] = [];
    let n = 0;

    const open = (type: string, label?: string): ParsedSection => {
        const section: ParsedSection = {
            id: `s${n++}`,
            type: isSectionType(type) ? type : 'verse',
            label: label || '',
            note: '',
            lines: [],
            repeat: 1,
        };
        sections.push(section);
        return section;
    };

    // `as` evita que TS estreche el tipo a `null` por la inicialización.
    let cur = null as ParsedSection | null;

    for (const raw of text.split('\n')) {
        const line = raw.trim();
        if (!line) continue;

        let m: RegExpMatchArray | null;

        if ((m = line.match(START))) {
            cur = open(m[1].toLowerCase(), m[2]);
            continue;
        }
        if (END.test(line)) {
            cur = null;
            continue;
        }
        if ((m = line.match(COMMENT))) {
            if (cur && !cur.note && !cur.lines.length) cur.note = m[1];
            else if (cur && m[1]) cur.lines.push({ comment: m[1] });
            continue;
        }
        if ((m = line.match(REPEAT))) {
            if (cur) cur.repeat = Math.max(1, Math.min(99, Number(m[1])));
            continue;
        }
        if (DIRECTIVE.test(line)) continue; // {title:}, {key:}, etc.

        cur ??= open('verse');
        cur.lines.push({ tokens: parseLine(raw.trimEnd()) });
    }
    return sections;
}