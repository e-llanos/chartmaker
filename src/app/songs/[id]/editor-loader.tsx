import { notFound } from 'next/navigation';
import { isSongView, songEditPath, type SongView } from '@/config/routes';
import FormatEditorPage from '@/features/songs/components/FormatEditorPage';
import { authorizePage } from '@/server/auth/guard';
import { getSongById } from '@/server/songs';
import Forbidden from '@/shared/ui/Forbidden';

export interface EditorParams {
    params: Promise<{ id: string; format?: string }>;
    /** Formato fijo (la ruta /songs/:id/edit es el del cifrado); si falta, sale de la URL. */
    format?: SongView;
}

/** Carga la canción y abre el editor del formato. Lo comparten todas las rutas de edición. */
export default async function EditorLoader({ params, format }: EditorParams) {
    const { id, format: slug } = await params;
    const view = format ?? slug;
    if (!isSongView(view)) notFound();

    // Sin sesión lleva al login; sin rol de líder o administrador muestra el aviso.
    const user = await authorizePage('song:update', songEditPath(id, view));
    if (!user) return <Forbidden />;

    const song = await getSongById(id);
    if (!song) notFound();
    return <FormatEditorPage song={song} format={view} />;
}