import { Suspense } from 'react';
import EditorLoader, { type EditorParams } from '../editor-loader';

export default function EditSongPage({ params }: Pick<EditorParams, 'params'>) {
    return (
        <Suspense fallback={<p>Cargando editor…</p>}>
            <EditorLoader params={params} format="cifrado" />
        </Suspense>
    );
}