import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ROLE_LABELS, ROLES } from '@/domain/auth/roles';
import { authorizePage } from '@/server/auth/guard';
import { listUsers } from '@/server/users';
import Forbidden from '@/shared/ui/Forbidden';
import { updateRole } from './actions';

export const metadata: Metadata = { title: 'Usuarios' };

export default function AdminUsersPage() {
    return (
        <main className="page-container">
            <h1>Usuarios</h1>
            <Suspense fallback={<p>Cargando usuarios…</p>}>
                <UsersTable />
            </Suspense>
        </main>
    );
}

async function UsersTable() {
    const me = await authorizePage('user:manage', '/admin/users');
    if (!me) return <Forbidden />;
    const users = await listUsers();

    return (
        <table className="users-table">
            <thead>
                <tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr>
            </thead>
            <tbody>
                {users.map((u) => (
                    <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                            <form action={updateRole} className="role-form">
                                <input type="hidden" name="userId" value={u.id} />
                                <select name="role" defaultValue={u.role} disabled={u.id === me.id} aria-label={`Rol de ${u.name}`}>
                                    {ROLES.map((role) => (
                                        <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                                    ))}
                                </select>
                                <button type="submit" disabled={u.id === me.id}>Guardar</button>
                            </form>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}