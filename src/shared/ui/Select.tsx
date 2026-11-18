'use client';

import { useRef, useState } from 'react';
import { LuCheck, LuChevronDown } from 'react-icons/lu';

export interface SelectOption<T extends string> {
    value: T;
    label: string;
}

interface SelectProps<T extends string> {
    value: T;
    options: readonly SelectOption<T>[];
    onChange: (value: T) => void;
    label: string;
}

export default function Select<T extends string>({ value, options, onChange, label }: SelectProps<T>) {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const current = options.find((o) => o.value === value);

    function show() {
        const list = listRef.current;
        const trigger = triggerRef.current;
        if (!list || !trigger) return;
        if (list.matches(':popover-open')) {
            list.hidePopover();
            return;
        }
        const r = trigger.getBoundingClientRect();
        const below = window.innerHeight - r.bottom - 12;
        const above = r.top - 12;
        // Se abre hacia abajo; si no cabe y hay más sitio arriba, hacia arriba.
        const up = below < 180 && above > below;
        list.style.minWidth = `${r.width}px`;
        list.style.right = `${Math.max(12, window.innerWidth - r.right)}px`;
        list.style.maxHeight = `${Math.max(140, up ? above : below)}px`;
        if (up) {
            list.style.top = 'auto';
            list.style.bottom = `${window.innerHeight - r.top + 4}px`;
        } else {
            list.style.bottom = 'auto';
            list.style.top = `${r.bottom + 4}px`;
        }
        list.showPopover();
        list.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
    }

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className="select-trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={label}
                onClick={show}
            >
                <span>{current?.label ?? '—'}</span>
                <LuChevronDown size={14} aria-hidden="true" />
            </button>

            <div
                ref={listRef}
                popover="auto"
                role="listbox"
                aria-label={label}
                className="select-list"
                onToggle={(e) => setOpen((e.nativeEvent as ToggleEvent).newState === 'open')}
            >
                {options.map((o) => (
                    <button
                        key={o.value}
                        type="button"
                        role="option"
                        aria-selected={o.value === value}
                        className="select-option"
                        onClick={() => {
                            onChange(o.value);
                            listRef.current?.hidePopover();
                            triggerRef.current?.focus();
                        }}
                    >
                        <span>{o.label}</span>
                        {o.value === value && <LuCheck size={15} aria-hidden="true" />}
                    </button>
                ))}
            </div>
        </>
    );
}