'use client';

import { songPath } from '@/config/routes';
import type { Chart } from '@/domain/chart/types';
import type { Score } from '@/domain/score/types';
import type { SongInput } from '@/domain/song/types';
import ScoreEditor from '@/features/score/components/ScoreEditor';
import ResourceEditorPage from './ResourceEditorPage';

interface EditScoreClientProps {
    id: string;
    song: SongInput;
    initial: Score;
    /** Chart simple existente, para usarlo como punto de partida. */
    baseChart?: Chart;
}

export default function EditScoreClient({ id, song, initial, baseChart }: EditScoreClientProps) {
    return (
        <ResourceEditorPage
            title={`Chart avanzado · ${song.title || 'Sin título'}`}
            initial={initial}
            request={{
                url: `/api/songs/${id}`,
                method: 'PATCH',
                redirectTo: () => songPath(id, 'advanced'),
            }}
            toPayload={(score) => ({ score })}
        >
            {(editor) => (
                <ScoreEditor song={song} initial={editor.initial} baseChart={baseChart} onChange={editor.onChange} />
            )}
        </ResourceEditorPage>
    );
}
