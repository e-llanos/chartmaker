'use client';

import { songPath } from '@/config/routes';
import type { Chart } from '@/domain/chart/types';
import type { SongInput } from '@/domain/song/types';
import ChartEditor from '@/features/chart/components/ChartEditor';
import ResourceEditorPage from './ResourceEditorPage';

interface EditChartClientProps {
    id: string;
    song: SongInput;
    initial: Chart;
}

export default function EditChartClient({ id, song, initial }: EditChartClientProps) {
    return (
        <ResourceEditorPage
            title={`Editor de chart · ${song.title || 'Sin título'}`}
            initial={initial}
            request={{
                url: `/api/songs/${id}`,
                method: 'PATCH',
                redirectTo: () => songPath(id, 'chart'),
            }}
            toPayload={(chart) => ({ chart })}
        >
            {(editor) => <ChartEditor song={song} initial={editor.initial} onChange={editor.onChange} />}
        </ResourceEditorPage>
    );
}
