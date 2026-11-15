'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LuLogOut, LuUser } from 'react-icons/lu';
import { authClient } from '@/shared/auth/auth-client';

export interface RailUser {
    name: string;
    email: string;
    initials: string;
    roleLabel: string;
}

interface ProfileMenuProps {
    user: RailUser;
    /** Se llama al navegar (por ejemplo, para cerrar el menú lateral en móvil). */
    onNavigate?: () => void;
}

export default function ProfileMenu({ user, onNavigate }: ProfileMenuProps) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Se cierra al pulsar fuera o con Escape.
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    async function signOut() {
        setBusy(true);
        await authClient.signOut();
        window.location.assign('/'); // recarga completa: limpia cualquier estado de la sesión anterior
    }

    return (
        <div className="rail-profile" ref={ref}>
            <button
                type="button"
                className="rail-avatar"
                data-label={user.name}
                aria-label={`Menú de ${user.name}`}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
                {user.initials}
            </button>

            {open && (
                <div className="profile-menu" role="menu">
                    <div className="profile-menu-head">
                        <span className="profile-menu-name">{user.name}</span>
                        <span className="profile-menu-sub">{user.email}</span>
                        <span className="role-chip">{user.roleLabel}</span>
                    </div>
                    <Link
                        href="/profile"
                        role="menuitem"
                        className="profile-menu-item"
                        onClick={() => {
                            setOpen(false);
                            onNavigate?.();
                        }}
                    >
                        <LuUser size={16} aria-hidden="true" />
                        Perfil
                    </Link>
                    <button
                        type="button"
                        role="menuitem"
                        className="profile-menu-item is-danger"
                        onClick={signOut}
                        disabled={busy}
                    >
                        <LuLogOut size={16} aria-hidden="true" />
                        {busy ? 'Saliendo…' : 'Cerrar sesión'}
                    </button>
                </div>
            )}
        </div>
    );
}