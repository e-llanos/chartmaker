'use client';

import { songPath } from '@/config/routes';
import { DEFAULT_SONG_INPUT } from '@/domain/song/constants';
import ChordSheetEditor from '@/features/chordsheet/components/ChordSheetEditor';
import ResourceEditorPage from './ResourceEditorPage';

export default function NewSongClient() {
    return (
        <ResourceEditorPage
            title="Nueva canción"
            initial={DEFAULT_SONG_INPUT}
            request={{
                url: '/api/songs',
                method: 'POST',
                redirectTo: (res) => (res.id ? songPath(res.id, 'cifrado') : null),
            }}
            canSave={(song) => song.title.trim() !== ''}
        >
            {(editor) => <ChordSheetEditor initial={editor.initial} onChange={editor.onChange} />}
        </ResourceEditorPage>
    );
}
