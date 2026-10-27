'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CifradoEditor, { type CifradoData } from '@/components/cifrado/CifradoEditor';

interface EditSongClientProps {
    id: string;
    initial: CifradoData;
}

export default function EditSongClient({ id, initial }: EditSongClientProps) {
    const router = useRouter();
    const [song, setSong] = useState<CifradoData>(initial);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSave() {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`/api/songs/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(song),
            });
            if (!res.ok) {
                const data = (await res.json().catch(() => null)) as { error?: string } | null;
                throw new Error(data?.error ?? 'No se pudo guardar');
            }
            router.push(`/songs/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setSaving(false);
        }
    }

    return (
        <main className="page-wide">
            <div className="editor-header">
                <h1>Editor de cifrado</h1>
                <button type="button" onClick={handleSave} disabled={saving || !song.title.trim()}>
                    {saving ? 'Guardando…' : 'Guardar'}
                </button>
            </div>
            {error && <p role="alert" className="form-error">{error}</p>}
            <CifradoEditor initial={song} onChange={setSong} />
        </main>
    );
}