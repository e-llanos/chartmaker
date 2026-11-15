import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ROLE_LABELS } from '@/domain/auth/roles';
import SignOutButton from '@/features/auth/components/SignOutButton';
import { requireUser } from '@/server/auth/guard';
import { initialsOf } from '@/shared/ui/initials';

export const metadata: Metadata = { title: 'Perfil' };

export default function ProfilePage() {
    return (
        <main className="page-container">
            <h1>Perfil</h1>
            <Suspense fallback={<p>Cargando…</p>}>
                <ProfileContent />
            </Suspense>
        </main>
    );
}

async function ProfileContent() {
    const user = await requireUser('/profile');
    return (
        <section className="profile-card">
            <div className="profile-avatar" aria-hidden="true">{initialsOf(user.name)}</div>
            <div className="profile-info">
                <h2>{user.name}</h2>
                <p className="profile-email">{user.email}</p>
                <span className="role-chip">{ROLE_LABELS[user.role]}</span>
            </div>
            <SignOutButton className="btn-outline" />
        </section>
    );
}