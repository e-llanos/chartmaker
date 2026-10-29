'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface SaveResponse {
    id?: string;
}

export interface SaveRequest {
    url: string;
    method: 'POST' | 'PATCH';
    /** Ruta a la que ir tras guardar. Devolver null indica que la respuesta no era válida. */
    redirectTo: (response: SaveResponse) => string | null;
}

/** Envía la canción al servidor, gestiona el estado de guardado y el error, y redirige al terminar. */
export function useSaveSong({ url, method, redirectTo }: SaveRequest) {
    const router = useRouter();
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function save(payload: unknown): Promise<void> {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = (await res.json().catch(() => null)) as (SaveResponse & { error?: string }) | null;
            if (!res.ok) throw new Error(data?.error ?? 'No se pudo guardar');

            const target = redirectTo(data ?? {});
            if (!target) throw new Error('La respuesta del servidor no incluye el id de la canción');
            router.push(target);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setSaving(false);
        }
    }

    return { save, saving, error };
}
