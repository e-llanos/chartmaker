'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuFileX } from 'react-icons/lu';

interface DeleteSongButtonProps {
    id: string;
    title: string;
}

/** Fila "Eliminar canción" de las preferencias, con ventana de confirmación. */
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
            <button type="button" className="pref-row pref-action pref-danger" onClick={openDialog}>
                <span className="pref-label">
                    <LuFileX size={18} aria-hidden="true" />
                    Eliminar canción
                </span>
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