import Breadcrumbs, { type Crumb } from '@/shared/ui/Breadcrumbs';
import SidebarToggle from './SidebarToggle';

/** Id del hueco donde el detalle de la canción coloca su barra de opciones. */
export const SONG_BAR_SLOT_ID = 'song-bar-slot';

/** Ruta de las páginas de canciones; con la biblioteca visible incluye el botón que la contrae. */
export default function SongsBreadcrumbs({ items }: { items: readonly Crumb[] }) {
    return (
        <Breadcrumbs
            items={items}
            leading={<SidebarToggle />}
            trailing={<div id={SONG_BAR_SLOT_ID} className="crumbs-tools" />}
        />
    );
}
