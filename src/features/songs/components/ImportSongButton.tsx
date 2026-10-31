'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CHARTMAKER_EXT, CHARTMAKER_MAX_BYTES, parseChartmaker } from '@/domain/song/chartmaker';

export default function ImportSongButton() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function onFile(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = ''; // permite volver a elegir el mismo archivo
        if (!file) return;

        setBusy(true);
        setError(null);
        try {
            if (file.size > CHARTMAKER_MAX_BYTES) throw new Error('El archivo es demasiado grande');
            const parsed = parseChartmaker(await file.text());
            if (!parsed.ok) throw new Error(parsed.error);

            const res = await fetch('/api/songs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed.value),
            });
            const data = (await res.json().catch(() => null)) as { id?: string; error?: string } | null;
            if (!res.ok || !data?.id) throw new Error(data?.error ?? 'No se pudo importar la canción');
            router.push(`/songs/${data.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="import-wrap">
            <input ref={inputRef} type="file" accept={CHARTMAKER_EXT} hidden onChange={onFile} />
            <button type="button" className="ghost-btn" disabled={busy} onClick={() => inputRef.current?.click()}>
                {busy ? 'Importando…' : 'Importar'}
            </button>
            {error && <p role="alert" className="form-error import-error">{error}</p>}
        </div>
    );
}