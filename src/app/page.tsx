import Link from 'next/link';
import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Elige nuestros recursos.',
}

const CARDS = [
  {
    href: '/songs',
    title: 'Canciones',
    description: 'Cada canción reúne su cifrado, su chart y su chart avanzado en un solo lugar.',
    color: '#8a74e8',
    icon: '♪',
  },
  {
    href: '/songs/new',
    title: 'Nueva canción',
    description: 'Escribe el cifrado, o importa un archivo .chartmaker, para empezar.',
    color: '#e0684a',
    icon: '+',
  },
] as const;

export default function HomePage() {
  return (
    <main className="page-container">
      <section className="home-hero">
        <h1>{APP_NAME}</h1>
        <p>Elige qué quieres consultar o editar.</p>
      </section>

      <div className="home-cards">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="home-card"
            style={{ '--card-color': c.color } as React.CSSProperties}
          >
            <span className="home-card-icon" aria-hidden="true">{c.icon}</span>
            <h2>{c.title}</h2>
            <p>{c.description}</p>
            <span className="home-card-cta">Abrir →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}