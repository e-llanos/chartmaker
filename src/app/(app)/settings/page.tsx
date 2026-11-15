import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { can } from '@/domain/auth/roles';
import { requireUser } from '@/server/auth/guard';

export const metadata: Metadata = { title: 'Ajustes' };

export default function SettingsPage() {
    return (
        <main className="page-container">
            <h1>Ajustes</h1>
            <Suspense fallback={<p>Cargando…</p>}>
                <SettingsContent />
            </Suspense>
        </main>
    );
}

async function SettingsContent() {
    const user = await requireUser('/settings');
    return (
        <div className="settings-list">
            <Link href="/profile" className="settings-card">
                <strong>Perfil</strong>
                <span>Tu cuenta, tu rol y cerrar sesión.</span>
            </Link>
            {can(user.role, 'user:manage') && (
                <Link href="/admin/users" className="settings-card">
                    <strong>Usuarios y roles</strong>
                    <span>Cambia el rol de cada persona del equipo.</span>
                </Link>
            )}
            <div className="settings-card is-soon">
                <strong>Preferencias</strong>
                <span>Próximamente: tema, notación por defecto y tonalidad.</span>
            </div>
        </div>
    );
}