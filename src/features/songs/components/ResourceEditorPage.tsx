'use client';

import { useState, type ReactNode } from 'react';
import { useSaveSong, type SaveRequest } from '../hooks/useSaveSong';

interface ResourceEditorPageProps<T> {
    /** Texto del encabezado. */
    title: string;
    /** Valor con el que arranca el editor. */
    initial: T;
    request: SaveRequest;
    /** Convierte el estado del editor en el cuerpo de la petición (por defecto, el propio estado). */
    toPayload?: (value: T) => unknown;
    /** Condición adicional para poder guardar. */
    canSave?: (value: T) => boolean;
    /** Dibuja el editor: recibe el valor inicial y el callback para avisar de los cambios. */
    children: (editor: { initial: T; onChange: (value: T) => void }) => ReactNode;
}

/** Página de edición común: encabezado, botón Guardar, error y redirección. */
export default function ResourceEditorPage<T>({
    title, initial, request, toPayload, canSave, children,
}: ResourceEditorPageProps<T>) {
    const [value, setValue] = useState<T>(initial);
    const { save, saving, error } = useSaveSong(request);
    const savable = !saving && (canSave ? canSave(value) : true);

    return (
        <main className="page-wide">
            <div className="editor-header">
                <h1>{title}</h1>
                <button
                    type="button"
                    onClick={() => save(toPayload ? toPayload(value) : value)}
                    disabled={!savable}
                >
                    {saving ? 'Guardando…' : 'Guardar'}
                </button>
            </div>
            {error && <p role="alert" className="form-error">{error}</p>}
            {children({ initial, onChange: setValue })}
        </main>
    );
}
