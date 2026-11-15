'use client';

import { useState } from 'react';
import { authClient } from '@/shared/auth/auth-client';

export default function SignOutButton({ className = 'navbar-link' }: { className?: string }) {
    const [busy, setBusy] = useState(false);

    async function signOut() {
        setBusy(true);
        await authClient.signOut();
        window.location.assign('/'); // recarga completa: limpia cualquier estado de la sesión anterior
    }

    return (
        <button type="button" className={className} onClick={signOut} disabled={busy}>
            {busy ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
    );
}