'use client';

import { useState } from 'react';
import { OAUTH_PROVIDERS, type OAuthProvider } from '@/config/auth';
import { authClient } from '@/shared/auth/auth-client';
import ProviderIcon from './ProviderIcons';

interface LoginButtonsProps {
    providers: OAuthProvider[];
    /** Ruta a la que volver después de entrar. */
    next: string;
}

export default function LoginButtons({ providers, next }: LoginButtonsProps) {
    const [pending, setPending] = useState<OAuthProvider | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function signIn(provider: OAuthProvider) {
        setPending(provider);
        setError(null);
        const result = await authClient.signIn.social({ provider, callbackURL: next });
        // Si todo va bien, el navegador ya está yendo al proveedor.
        if (result.error) {
            setError(result.error.message ?? 'No se pudo iniciar sesión. Inténtalo de nuevo.');
            setPending(null);
        }
    }

    return (
        <div className="oauth-list">
            {providers.map((provider) => (
                <button
                    key={provider}
                    type="button"
                    className="oauth-btn"
                    disabled={pending !== null}
                    onClick={() => signIn(provider)}
                >
                    <ProviderIcon provider={provider} />
                    {pending === provider ? 'Redirigiendo…' : `Continuar con ${OAUTH_PROVIDERS[provider]}`}
                </button>
            ))}
            {error && <p className="login-error" role="alert">{error}</p>}
        </div>
    );
}