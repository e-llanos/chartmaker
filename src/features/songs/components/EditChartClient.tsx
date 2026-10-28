'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChartEditor from '@/features/chart/components/ChartEditor';
import type { Chart } from '@/domain/chart/types';
import type { SongInput } from '@/domain/song/types';
import { songPath } from '@/config/routes';

interface EditChartClientProps {
    id: string;
    song: SongInput;
    initial: Chart;
}

export default function EditChartClient({ id, song, initial }: EditChartClientProps) {
    const router = useRouter();
    const [chart, setChart] = useState<Chart>(initial);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSave() {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`/api/songs/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chart }),
            });
            if (!res.ok) {
                const data = (await res.json().catch(() => null)) as { error?: string } | null;
                throw new Error(data?.error ?? 'No se pudo guardar');
            }
            router.push(songPath(id, 'chart'));
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setSaving(false);
        }
    }

    return (
        <main className="page-wide">
            <div className="editor-header">
                <h1>Editor de chart · {song.title || 'Sin título'}</h1>
                <button type="button" onClick={handleSave} disabled={saving}>
                    {saving ? 'Guardando…' : 'Guardar'}
                </button>
            </div>
            {error && <p role="alert" className="form-error">{error}</p>}
            <ChartEditor song={song} initial={initial} onChange={setChart} />
        </main>
    );
}