'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteSongButtonProps {
    id: string;
    title: string;
}

export default function DeleteSongButton({ id, title }: DeleteSongButtonProps) {
    const router = useRouter();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    function openDialog() {
        setError(null);
        dialogRef.current?.showModal();
    }

    function closeDialog() {
        if (!deleting) dialogRef.current?.close();
    }

    async function confirmDelete() {
        setDeleting(true);
        setError(null);
        try {
            const res = await fetch(`/api/songs/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = (await res.json().catch(() => null)) as { error?: string } | null;
                throw new Error(data?.error ?? 'No se pudo eliminar la canción');
            }
            router.push('/songs');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setDeleting(false);
        }
    }

    return (
        <>
            <button
                type="button"
                className="icon-btn danger"
                onClick={openDialog}
                aria-label="Eliminar canción"
                title="Eliminar canción"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                </svg>
            </button>

            <dialog
                ref={dialogRef}
                className="modal"
                aria-labelledby="delete-song-title"
                onCancel={(e) => { if (deleting) e.preventDefault(); }}
                onClick={(e) => { if (e.target === e.currentTarget) closeDialog(); }}
            >
                <div className="modal-body">
                    <h2 id="delete-song-title">¿Eliminar canción?</h2>
                    <p>
                        Vas a eliminar <strong>{title || 'esta canción'}</strong>.
                        Esta acción no se puede deshacer.
                    </p>
                    {error && <p role="alert" className="form-error">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" className="ghost-btn" onClick={closeDialog} disabled={deleting}>
                            Cancelar
                        </button>
                        <button type="button" className="danger-btn" onClick={confirmDelete} disabled={deleting}>
                            {deleting ? 'Eliminando…' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}