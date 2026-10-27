import type { Metadata } from 'next';
import NewSongClient from './NewSongClient';

export const metadata: Metadata = { title: 'Nueva canción' };

export default function NewSongPage() {
    return <NewSongClient />;
}