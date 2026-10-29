'use client';

import { songPath } from '@/config/routes';
import ChordSheetEditor, { type ChordSheetData } from '@/features/chordsheet/components/ChordSheetEditor';
import ResourceEditorPage from './ResourceEditorPage';

interface EditSongClientProps {
    id: string;
    initial: ChordSheetData;
}

export default function EditSongClient({ id, initial }: EditSongClientProps) {
    return (
        <ResourceEditorPage
            title="Editor de cifrado"
            initial={initial}
            request={{
                url: `/api/songs/${id}`,
                method: 'PATCH',
                redirectTo: () => songPath(id, 'cifrado'),
            }}
            canSave={(song) => song.title.trim() !== ''}
        >
            {(editor) => <ChordSheetEditor initial={editor.initial} onChange={editor.onChange} />}
        </ResourceEditorPage>
    );
}
