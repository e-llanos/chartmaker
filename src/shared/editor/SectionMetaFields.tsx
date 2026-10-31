'use client';

import { REPEAT_MAX, REPEAT_MIN } from '@/domain/chordsheet/section-text';
import { SECTION_TYPES, SECTION_TYPE_KEYS, type SectionType } from '@/domain/sections/section-types';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon, PlusIcon, RepeatIcon, TrashIcon } from '@/shared/ui/Icons';

/** Campos que comparten las secciones del chart y del chart avanzado. */
export interface MetaSection {
    type: SectionType;
    label: string;
    note: string;
    repeat: number;
}

interface SectionMetaFieldsProps {
    section: MetaSection;
    onChange: (changes: Partial<MetaSection>) => void;
    notePlaceholder?: string;
    /** Icono junto a "Repetir sección" (el chart simple lo lleva; el avanzado no). */
    repeatIcon?: boolean;
}
/** Tipo, nombre, anotación y repeticiones de una sección. */
export default function SectionMetaFields({
    section, onChange, notePlaceholder = 'Anotación (ej. Pad & Piano)', repeatIcon = true,
}: SectionMetaFieldsProps) {
    return (
        <>
            <div className="meta-row">
                <select className="tool-select" value={section.type} aria-label="Tipo de sección"
                    onChange={(e) => onChange({ type: e.target.value as SectionType })}>
                    {SECTION_TYPE_KEYS.map((t) => (
                        <option key={t} value={t}>{SECTION_TYPES[t].label}</option>
                    ))}
                </select>
                <input className="tool-input" value={section.label} placeholder="Nombre (ej. Verso 1)"
                    aria-label="Nombre de la sección" onChange={(e) => onChange({ label: e.target.value })} />
            </div>

            <input className="tool-input" value={section.note} placeholder={notePlaceholder}
                aria-label="Anotación" onChange={(e) => onChange({ note: e.target.value })} />

            <div className="field-row">
                {repeatIcon && <RepeatIcon />}
                <span>Repetir sección</span>
                <div className="stepper">
                    <button type="button" className="ed-btn" aria-label="Menos repeticiones"
                        disabled={section.repeat <= REPEAT_MIN}
                        onClick={() => onChange({ repeat: section.repeat - 1 })}><MinusIcon /></button>
                    <output className="stepper-value">×{section.repeat}</output>
                    <button type="button" className="ed-btn" aria-label="Más repeticiones"
                        disabled={section.repeat >= REPEAT_MAX}
                        onClick={() => onChange({ repeat: section.repeat + 1 })}><PlusIcon /></button>
                </div>
            </div>
        </>
    );
}

interface SectionActionsProps {
    index: number;
    total: number;
    onMove: (dir: -1 | 1) => void;
    onRemove: () => void;
}

/** Subir, bajar y eliminar una sección. */
export function SectionActions({ index, total, onMove, onRemove }: SectionActionsProps) {
    return (
        <div className="section-footer">
            <button type="button" className="ed-btn" aria-label="Subir sección" title="Subir sección"
                disabled={index === 0} onClick={() => onMove(-1)}><ArrowUpIcon /></button>
            <button type="button" className="ed-btn" aria-label="Bajar sección" title="Bajar sección"
                disabled={index === total - 1} onClick={() => onMove(1)}><ArrowDownIcon /></button>
            <button type="button" className="ed-danger" onClick={onRemove}>
                <TrashIcon /> Eliminar
            </button>
        </div>
    );
}