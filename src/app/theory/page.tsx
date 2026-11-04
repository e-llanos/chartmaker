import type { Metadata } from 'next';
import { Suspense } from 'react';
import TheoryWorkspace from '@/features/theory/components/TheoryWorkspace';
import { parseTheoryTab } from '@/features/theory/tabs';
import ViewSkeleton from '@/shared/ui/ViewSkeleton';

export const metadata: Metadata = { title: 'Teoría musical' };

interface TheoryPageProps {
    searchParams: Promise<{ tab?: string | string[] }>;
}

export default function TheoryPage({ searchParams }: TheoryPageProps) {
    return (
        <main className="page-container">
            <header className="theory-header">
                <h1>Teoría musical</h1>
                <p>Escalas, acordes, armonía y la simbología que usan los charts, con herramientas para construirlos en cualquier tonalidad.</p>
            </header>
            <Suspense fallback={<ViewSkeleton />}>
                <TheoryTabs searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function TheoryTabs({ searchParams }: TheoryPageProps) {
    const { tab } = await searchParams;
    return <TheoryWorkspace initialTab={parseTheoryTab(tab)} />;
}