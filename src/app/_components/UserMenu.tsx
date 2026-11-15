import Link from 'next/link';
import { can, ROLE_LABELS } from '@/domain/auth/roles';
import SignOutButton from '@/features/auth/components/SignOutButton';
import { getCurrentUser } from '@/server/auth/session';

export default async function UserMenu() {
    const user = await getCurrentUser();
    if (!user) return <Link href="/login" className="navbar-link">Entrar</Link>;

    return (
        <div className="user-menu">
            {can(user.role, 'user:manage') && <Link href="/admin/users" className="navbar-link">Usuarios</Link>}
            <span className="user-chip" title={user.email}>{user.name} · {ROLE_LABELS[user.role]}</span>
            <SignOutButton />
        </div>
    );
}