'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ScoreEditor from '@/components/score/ScoreEditor';
import type { Chart } from '@/lib/chart/chart.types';
import type { SongInput } from '@/lib/data/song.types';
import type { Score } from '@/lib/score/score.types';
import { songPath } from '@/lib/songRoutes';

interface Props {
    id: string;
    song: SongInput;
    initial: Score;
    baseChart?: Chart;
}

export default function EditScoreClient({ id, song, initial, baseChart }: Props) {
    const router = useRouter();
    const [score, setScore] = useState<Score>(initial);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSave() {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`/api/songs/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score }),
            });
            if (!res.ok) {
                const data = (await res.json().catch(() => null)) as { error?: string } | null;
                throw new Error(data?.error ?? 'No se pudo guardar');
            }
            router.push(songPath(id, 'advanced'));
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setSaving(false);
        }
    }

    return (
        <main className="page-wide">
            <div className="editor-header">
                <h1>Chart avanzado · {song.title || 'Sin título'}</h1>
                <button type="button" onClick={handleSave} disabled={saving}>
                    {saving ? 'Guardando…' : 'Guardar'}
                </button>
            </div>
            {error && <p role="alert" className="form-error">{error}</p>}
            <ScoreEditor song={song} initial={initial} baseChart={baseChart} onChange={setScore} />
        </main>
    );
}