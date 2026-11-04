'use client';

import { useState } from 'react';
import { THEORY_TABS, type TheoryTab } from '../tabs';
import ChordBuilder from './ChordBuilder';
import HarmonyGuide from './HarmonyGuide';
import ScaleBuilder from './ScaleBuilder';
import SymbolsGuide from './SymbolsGuide';

interface TheoryWorkspaceProps {
    initialTab: TheoryTab;
}

export default function TheoryWorkspace({ initialTab }: TheoryWorkspaceProps) {
    const [tab, setTab] = useState<TheoryTab>(initialTab);

    function select(next: TheoryTab) {
        setTab(next);
        // Refleja la pestaña en la URL sin navegar
        const url = new URL(window.location.href);
        if (next === 'scales') url.searchParams.delete('tab');
        else url.searchParams.set('tab', next);
        window.history.replaceState(null, '', `${url.pathname}${url.search}`);
    }

    return (
        <>
            <nav className="song-tabs" aria-label="Secciones de teoría">
                {THEORY_TABS.map((t) => (
                    <button key={t.id} type="button" className="song-tab"
                        aria-current={tab === t.id ? 'true' : undefined} onClick={() => select(t.id)}>
                        {t.label}
                    </button>
                ))}
            </nav>

            {/* Los cuatro paneles quedan montados: al cambiar de pestaña se conserva lo elegido en cada uno */}
            <div hidden={tab !== 'scales'}><ScaleBuilder /></div>
            <div hidden={tab !== 'chords'}><ChordBuilder /></div>
            <div hidden={tab !== 'harmony'}><HarmonyGuide /></div>
            <div hidden={tab !== 'symbols'}><SymbolsGuide /></div>
        </>
    );
}