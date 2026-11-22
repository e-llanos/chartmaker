import type { ParsedSection } from '@/domain/chordsheet/parse-sections';
import type { ViewMode } from '@/domain/chordsheet/view-mode';
import { SECTION_TYPES, type Badge } from '@/domain/sections/section-types';
import type { PdfLayout } from './pdf-sheet';

export type PdfMode = ViewMode;

export interface PdfToken {
    chord: string | null;
    text: string;
}

export interface PdfSection {
    badge: { text: string; color: string };
    label: string;
    note: string;
    repeat: number;
    lines: Array<{ comment: string } | { tokens: PdfToken[] }>;
}

export interface PdfSong {
    title: string;
    artist: string;
    /** "Tono: G", "Tempo: 72 BPM"… ya formateados. */
    meta: string[];
    mode: PdfMode;
    sections: PdfSection[];
    layout: PdfLayout;
}

interface BuildArgs {
    title: string;
    artist: string;
    meta: string[];
    mode: PdfMode;
    sections: ParsedSection[];
    badges: Badge[];
    mapChord: (chord: string) => string;
    layout: PdfLayout;
}

export function buildPdfSong({ title, artist, meta, mode, layout, sections, badges, mapChord }: BuildArgs): PdfSong {
    return {
        title: title || 'Sin título',
        artist,
        meta,
        mode,
        layout,
        sections: sections.map((s, i) => ({
            badge: { text: badges[i]?.text ?? '', color: badges[i]?.color ?? '#888888' },
            label: s.label || SECTION_TYPES[s.type].label,
            note: s.note,
            repeat: s.repeat,
            lines: s.lines.map((l) =>
                'comment' in l
                    ? { comment: l.comment }
                    : { tokens: l.tokens.map((t) => ({ chord: t.chord ? mapChord(t.chord) : null, text: t.text })) }
            ),
        })),
    };
}