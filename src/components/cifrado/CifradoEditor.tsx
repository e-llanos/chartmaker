'use client';

import { useMemo, useRef, useState } from 'react';
import { nextLabel, type SectionType } from '@/lib/sections/sectionTypes';
import { getSectionRepeat, setSectionRepeat } from '@/lib/cifrado/sectionText';
import { normalizeChord } from '@/lib/music/engine';
import { DEFAULT_SONG_INPUT } from '@/lib/data/song.constants';
import type { SongInput } from '@/lib/data/song.types';
import EditorLayout from '../shared/EditorLayout';
import CifradoToolbar from './CifradoToolbar';
import CifradoViewer from './CifradoViewer';

export type CifradoData = SongInput;

interface CifradoEditorProps {
    initial?: Partial<CifradoData>;
    onChange?: (data: CifradoData) => void;
}

export default function CifradoEditor({ initial = {}, onChange }: CifradoEditorProps) {
    const [data, setData] = useState<CifradoData>({ ...DEFAULT_SONG_INPUT, ...initial });
    const ref = useRef<HTMLTextAreaElement>(null);
    const [caret, setCaret] = useState<number>(0);
    const repeat = useMemo(() => getSectionRepeat(data.body, caret), [data.body, caret]);

    function syncCaret() {
        const el = ref.current;
        if (el) setCaret(el.selectionStart);
    }

    function changeRepeat(n: number) {
        const el = ref.current;
        if (!el) return;
        const result = setSectionRepeat(data.body, el.selectionStart, n);
        if (!result) return;
        commit({ body: result.body });
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(result.caret, result.caret);
            setCaret(result.caret);
        });
    }

    function commit(next: Partial<CifradoData>) {
        const d: CifradoData = { ...data, ...next };
        setData(d);
        onChange?.(d);
    }

    /** Inserta texto en el cursor y deja el cursor `cursorAt` caracteres adentro. */
    function insertAtCursor(text: string, cursorAt: number = text.length) {
        const el = ref.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        commit({ body: data.body.slice(0, start) + text + data.body.slice(end) });
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(start + cursorAt, start + cursorAt);
        });
    }

    function addSection(type: SectionType) {
        const { body } = data;
        const count = (body.match(new RegExp(`\\{start_of_${type}\\b`, 'gi')) || []).length;
        const open = `{start_of_${type}: ${nextLabel(type, count)}}\n`;
        const snippet = `${open}\n{end_of_${type}}\n`;
        const prefix = body.trim() ? `${body.replace(/\s*$/, '')}\n\n` : '';
        commit({ body: prefix + snippet });
        requestAnimationFrame(() => {
            const el = ref.current;
            if (!el) return;
            el.focus();
            const pos = prefix.length + open.length;
            el.setSelectionRange(pos, pos);
        });
    }

    const tools = (
        <>
            <CifradoToolbar
                data={data}
                onFieldChange={(field, value) => commit({ [field]: value } as Partial<CifradoData>)}
                onAddSection={addSection}
                onInsertChord={(c) => insertAtCursor(`[${normalizeChord(c)}]`)}
                onInsertNote={() => insertAtCursor('{comment: }', '{comment: '.length)}
                repeat={repeat}
                onRepeatChange={changeRepeat}
            />
            <div className="tool-group grow">
                <h3>Texto del cifrado</h3>
                <textarea
                    ref={ref}
                    className="chordpro-input"
                    value={data.body}
                    onChange={(e) => commit({ body: e.target.value })}
                    spellCheck={false}
                    placeholder={'Agrega una sección y escribe la letra.\nPon el acorde antes de la sílaba: [Am]Primera [C]línea'}
                    onSelect={syncCaret}
                    onKeyUp={syncCaret}
                    onClick={syncCaret}
                />
            </div>
        </>
    );

    return (
        <EditorLayout
            tools={tools}
            preview={
                <CifradoViewer
                    chordProText={data.body}
                    originalKey={data.key}
                    title={data.title}
                    meta={data}
                />
            }
        />
    );
}