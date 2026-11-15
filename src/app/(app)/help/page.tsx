import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ayuda' };

export default function HelpPage() {
    return (
        <main className="page-container">
            <h1>Ayuda</h1>
            <p className="settings-soon">
                Próximamente: guías para escribir cifrados, armar charts y usar la sección de teoría.
            </p>
        </main>
    );
}