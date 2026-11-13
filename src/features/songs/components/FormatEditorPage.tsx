'use client';

import { useMemo } from 'react';
import { songPath, type SongView } from '@/config/routes';
import { toSongInput } from '@/domain/song/constants';
import type { Song } from '@/domain/song/types';
import { SONG_FORMATS } from '@/features/songs/formats';
import ResourceEditorPage from './ResourceEditorPage';

interface FormatEditorPageProps {
    song: Song;
    format: SongView;
}

/** Página de edición de cualquier formato: el registro dice cómo se edita y se guarda. */
export default function FormatEditorPage({ song, format }: FormatEditorPageProps) {
    const { editor } = SONG_FORMATS[format];
    const input = useMemo(() => toSongInput(song), [song]);

    return (
        <ResourceEditorPage
            title={editor.title(input)}
            initial={editor.initial(song)}
            request={{
                url: `/api/songs/${song.id}`,
                method: 'PATCH',
                redirectTo: () => songPath(song.id, format),
            }}
            toPayload={editor.toPayload}
            canSave={editor.canSave}
        >
            {(state) => <editor.Editor song={song} input={input} initial={state.initial} onChange={state.onChange} />}
        </ResourceEditorPage>
    );
}