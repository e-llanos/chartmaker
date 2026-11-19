'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LuCircleHelp, LuLogOut, LuUser } from 'react-icons/lu';
import { authClient } from '@/shared/auth/auth-client';

export interface RailUser {
    name: string;
    email: string;
    initials: string;
    roleLabel: string;
}

interface ProfileMenuProps {
    user: RailUser;
    /** rail: avatar de la barra lateral. tab: pestaña "Perfil" de la barra inferior. */
    variant?: 'rail' | 'tab';
    /** Se llama al navegar. */
    onNavigate?: () => void;
}

export default function ProfileMenu({ user, variant = 'rail', onNavigate }: ProfileMenuProps) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const isTab = variant === 'tab';

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

    const goTo = () => {
        setOpen(false);
        onNavigate?.();
    };

    return (
        <div className={isTab ? 'tab-profile' : 'rail-profile'} ref={ref}>
            <button
                type="button"
                className={isTab ? 'tab-item' : 'rail-avatar'}
                data-label={isTab ? undefined : user.name}
                aria-label={`Menú de ${user.name}`}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
                {isTab ? (
                    <>
                        <span className="tab-icon">
                            <span className="tab-avatar">{user.initials}</span>
                        </span>
                        <span className="tab-label">Perfil</span>
                    </>
                ) : (
                    user.initials
                )}
            </button>

            {open && (
                <div className={isTab ? 'profile-menu is-up' : 'profile-menu'} role="menu">
                    <div className="profile-menu-head">
                        <span className="profile-menu-name">{user.name}</span>
                        <span className="profile-menu-sub">{user.email}</span>
                        <span className="role-chip">{user.roleLabel}</span>
                    </div>
                    <Link href="/profile" role="menuitem" className="profile-menu-item" onClick={goTo}>
                        <LuUser size={16} aria-hidden="true" />
                        Perfil
                    </Link>
                    {isTab && (
                        <Link href="/help" role="menuitem" className="profile-menu-item" onClick={goTo}>
                            <LuCircleHelp size={16} aria-hidden="true" />
                            Ayuda
                        </Link>
                    )}
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