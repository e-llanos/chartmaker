import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { APP_NAME } from '@/config/app';
import { safeNext } from '@/config/routes';
import LoginButtons from '@/features/auth/components/LoginButtons';
import LoginPreview from '@/features/auth/components/LoginPreview';
import { configuredProviders } from '@/server/auth/providers';
import { getCurrentUser } from '@/server/auth/session';
import BrandMark from '@/shared/ui/BrandMark';

export const metadata: Metadata = { title: 'Te damos la bienvenida' };

interface PageProps {
    searchParams: Promise<{ next?: string | string[] }>;
}

export default function LoginPage({ searchParams }: PageProps) {
    return (
        <main className="login-split">
            <section className="login-pane">
                <header className="login-brand">
                    <BrandMark size={30} />
                    <span>{APP_NAME}</span>
                </header>

                <div className="login-body">
                    <h1>Te damos la bienvenida a {APP_NAME}</h1>
                    <p className="login-sub">
                        Inicia sesión o crea una cuenta para escribir cifrados y charts y compartirlos con tu equipo.
                    </p>
                    <Suspense fallback={<div className="oauth-skeleton" aria-hidden="true" />}>
                        <LoginProviders searchParams={searchParams} />
                    </Suspense>
                </div>

                <footer className="login-foot">© {APP_NAME}</footer>
            </section>

            <aside className="login-preview" aria-hidden="true">
                <LoginPreview />
            </aside>
        </main>
    );
}

async function LoginProviders({ searchParams }: PageProps) {
    const { next } = await searchParams;
    const target = safeNext(Array.isArray(next) ? next[0] : next);
    if (await getCurrentUser()) redirect(target);

    const providers = configuredProviders();
    if (providers.length === 0) {
        return (
            <p className="login-note">
                No hay proveedores configurados. Define GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET en .env.local.
            </p>
        );
    }
    return <LoginButtons providers={providers} next={target} />;
}