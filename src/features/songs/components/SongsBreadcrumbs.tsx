import Breadcrumbs, { type Crumb } from '@/shared/ui/Breadcrumbs';
import SidebarToggle from './SidebarToggle';

/** Ruta de las páginas de canciones; con la biblioteca visible incluye el botón que la contrae. */
export default function SongsBreadcrumbs({ items }: { items: readonly Crumb[] }) {
    return <Breadcrumbs items={items} leading={<SidebarToggle />} />;
}