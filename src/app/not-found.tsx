import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Página no encontrada',
};

export default function NotFound() {
    return (
        <main className="page-container">
            <section className="not-found">
                <span className="not-found-code" aria-hidden="true">404</span>
                <h1>Página no encontrada</h1>
                <p>La página que buscas no existe o fue movida.</p>
                <div className="not-found-actions">
                    <Link href="/" className="primary-btn">Ir al inicio</Link>
                    <Link href="/songs" className="ghost-btn">Ver cifrados</Link>
                </div>
            </section>
        </main>
    );
}