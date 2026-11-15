'use server';

import { revalidatePath } from 'next/cache';
import { can, isRole } from '@/domain/auth/roles';
import { getCurrentUser } from '@/server/auth/session';
import { setUserRole } from '@/server/users';

export async function updateRole(formData: FormData): Promise<void> {
    const me = await getCurrentUser();
    if (!me || !can(me.role, 'user:manage')) throw new Error('No tienes permiso');

    const userId = formData.get('userId');
    const role = formData.get('role');
    if (typeof userId !== 'string' || !isRole(role)) throw new Error('Datos inválidos');
    // Nadie puede quitarse su propio rol: así siempre queda al menos un administrador.
    if (userId === me.id) throw new Error('No puedes cambiar tu propio rol');

    await setUserRole(userId, role);
    revalidatePath('/admin/users');
}