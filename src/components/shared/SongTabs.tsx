import Link from 'next/link';

interface SongTabsProps {
    id: string;
    active: 'cifrado' | 'chart' | 'advanced';
}

export default function SongTabs({ id, active }: SongTabsProps) {
    return (
        <nav className="song-tabs" aria-label="Vista de la canción">
            <Link href={`/songs/${id}`} className="song-tab"
                aria-current={active === 'cifrado' ? 'page' : undefined}>Cifrado</Link>
            <Link href={`/charts/${id}`} className="song-tab"
                aria-current={active === 'chart' ? 'page' : undefined}>Chart</Link>
            <Link href={`/charts/${id}/advanced`} className="song-tab"
                aria-current={active === 'advanced' ? 'page' : undefined}>Chart avanzado</Link>
        </nav>
    );
}