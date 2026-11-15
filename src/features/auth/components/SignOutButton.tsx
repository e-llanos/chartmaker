'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/shared/auth/auth-client';

export default function SignOutButton() {
    const [busy, setBusy] = useState(false);
    const router = useRouter();

    async function signOut() {
        setBusy(true);
        try {
            await authClient.signOut();
            router.replace('/');
            router.refresh();
        } finally {
            setBusy(false);
        }
    }

    return (
        <button type="button" className="navbar-link" onClick={signOut} disabled={busy}>
            Salir
        </button>
    );
}