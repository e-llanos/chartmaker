import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { safeNext } from '@/config/routes';
import LoginButtons from '@/features/auth/components/LoginButtons';
import { configuredProviders } from '@/server/auth/providers';
import { getCurrentUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Entrar' };

interface PageProps {
    searchParams: Promise<{ next?: string | string[] }>;
}

export default function LoginPage({ searchParams }: PageProps) {
    return (
        <main className="page-container">
            <Suspense fallback={<p>Cargando…</p>}>
                <LoginContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function LoginContent({ searchParams }: PageProps) {
    const { next } = await searchParams;
    const target = safeNext(Array.isArray(next) ? next[0] : next);
    if (await getCurrentUser()) redirect(target);

    const providers = configuredProviders();
    return (
        <section className="login-card">
            <h1>Entrar</h1>
            <p>Entra con tu cuenta. Si es tu primera vez, tu registro se crea automáticamente como músico.</p>
            {providers.length === 0 ? (
                <p className="login-note">
                    No hay proveedores configurados. Define GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET en .env.local.
                </p>
            ) : (
                <LoginButtons providers={providers} next={target} />
            )}
        </section>
    );
}