import Link from 'next/link';

export default function Forbidden() {
    return (
        <main className="page-container">
            <div className="empty-resource">
                <h2>No tienes permiso</h2>
                <p>Esta acción requiere el rol de líder o administrador. Pídele acceso a un administrador.</p>
                <Link href="/songs" className="primary-btn">Volver a las canciones</Link>
            </div>
        </main>
    );
}