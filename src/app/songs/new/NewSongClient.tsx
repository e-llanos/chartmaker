'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CifradoEditor, { type CifradoData } from '@/components/cifrado/CifradoEditor';
import { DEFAULT_SONG_INPUT } from '@/domain/song/constants';

export default function NewSongClient() {
    const router = useRouter();
    const [song, setSong] = useState<CifradoData>(DEFAULT_SONG_INPUT);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSave() {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/songs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(song),
            });
            const data = (await res.json()) as { id?: string; error?: string };
            if (!res.ok || !data.id) throw new Error(data.error ?? 'No se pudo guardar');
            router.push(`/songs/${data.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setSaving(false);
        }
    }

    return (
        <main className="page-wide">
            <div className="editor-header">
                <h1>Nueva canción</h1>
                <button type="button" onClick={handleSave} disabled={saving || !song.title.trim()}>
                    {saving ? 'Guardando…' : 'Guardar'}
                </button>
            </div>
            {error && <p role="alert" className="form-error">{error}</p>}
            <CifradoEditor initial={song} onChange={setSong} />
        </main>
    );
}