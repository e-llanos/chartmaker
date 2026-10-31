'use client';

import { ChevronsDownIcon, ChevronsUpIcon, SparklesIcon } from '@/shared/ui/Icons';

interface SectionsToolbarProps {
    subtitle: string;
    generateLabel: string;
    onCollapseAll: () => void;
    onExpandAll: () => void;
    onGenerate: () => void;
}

/** Título de la lista de secciones y acciones globales: contraer, expandir y generar. */
export default function SectionsToolbar({
    subtitle, generateLabel, onCollapseAll, onExpandAll, onGenerate,
}: SectionsToolbarProps) {
    return (
        <div className="sections-toolbar">
            <div className="sections-toolbar-text">
                <h3>Secciones</h3>
                <span className="hint">{subtitle}</span>
            </div>
            <div className="icon-row">
                <button type="button" className="ed-btn" onClick={onCollapseAll}
                    aria-label="Contraer todas" title="Contraer todas"><ChevronsUpIcon /></button>
                <button type="button" className="ed-btn" onClick={onExpandAll}
                    aria-label="Expandir todas" title="Expandir todas"><ChevronsDownIcon /></button>
                <button type="button" className="ed-btn" onClick={onGenerate}
                    aria-label={generateLabel} title={generateLabel}><SparklesIcon /></button>
            </div>
        </div>
    );
}