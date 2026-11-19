import Link from 'next/link';
import { LuLogIn } from 'react-icons/lu';
import { ROLE_LABELS } from '@/domain/auth/roles';
import { getCurrentUser } from '@/server/auth/session';
import Navbar from '@/shared/layout/Navbar';
import Sidebar from '@/shared/layout/Sidebar';
import { initialsOf } from '@/shared/ui/initials';

export default async function AppChrome() {
    const user = await getCurrentUser();
    if (!user) {
        return (
            <Navbar
                userMenu={
                    <Link href="/login" className="navbar-link">
                        Iniciar sesión
                    </Link>
                }
                bottomTrailing={
                    <Link href="/login" className="tab-item">
                        <span className="tab-icon">
                            <LuLogIn size={22} aria-hidden="true" />
                        </span>
                        <span className="tab-label">Entrar</span>
                    </Link>
                }
            />
        );
    }

    return (
        <Sidebar
            user={{
                name: user.name,
                email: user.email,
                initials: initialsOf(user.name),
                roleLabel: ROLE_LABELS[user.role],
            }}
        />
    );
}