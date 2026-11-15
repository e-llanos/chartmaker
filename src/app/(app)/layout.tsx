import type { ReactNode } from 'react';
import { Suspense } from 'react';
import Footer from '@/shared/layout/Footer';
import AppChrome from '../_components/AppChrome';

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="app-shell">
            <Suspense fallback={null}>
                <AppChrome />
            </Suspense>
            <div className="app-content">{children}</div>
            <Footer />
        </div>
    );
}