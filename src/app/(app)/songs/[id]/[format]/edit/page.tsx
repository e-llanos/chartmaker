import { Suspense } from 'react';
import EditorLoader, { type EditorParams } from '../../editor-loader';

/** /songs/:id/chart/edit, /songs/:id/advanced/edit… Un formato desconocido muestra la página de no encontrada. */
export default function EditFormatPage({ params }: Pick<EditorParams, 'params'>) {
    return (
        <Suspense fallback={<p>Cargando editor…</p>}>
            <EditorLoader params={params} />
        </Suspense>
    );
}