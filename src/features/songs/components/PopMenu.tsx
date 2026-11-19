'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface PopMenuProps {
    /** Contenido del botón que lo abre. */
    label: ReactNode;
    /** Si se indica, el botón muestra solo el icono y usa este texto como nombre accesible. */
    iconLabel?: string;
    /** Alinea el panel al borde derecho del botón (para los controles de la derecha). */
    alignEnd?: boolean;
    /** 'menu' es una lista de opciones; 'form' es un panel con campos. */
    variant?: 'menu' | 'form';
    children: ReactNode;
}

/** Menú desplegable: se cierra al pulsar fuera, con Escape o al elegir una opción. */
export default function PopMenu({ label, iconLabel, alignEnd = false, variant = 'form', children }: PopMenuProps) {
    const ref = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        const close = () => {
            if (ref.current?.open) ref.current.open = false;
        };
        const onPointerDown = (e: PointerEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) close();
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    const classes = ['lib-pop-panel', alignEnd ? 'is-end' : '', variant === 'menu' ? 'is-menu' : '']
        .filter(Boolean)
        .join(' ');

    return (
        <details className="lib-pop" ref={ref}>
            <summary
                className={`lib-tool-btn${iconLabel ? ' is-icon' : ''}`}
                aria-label={iconLabel}
                title={iconLabel}
            >
                {label}
            </summary>
            <div
                className={classes}
                // Elegir una opción o enviar el formulario cierra el menú.
                onClickCapture={(e) => {
                    if ((e.target as Element).closest('a') && ref.current) ref.current.open = false;
                }}
                onSubmitCapture={() => {
                    if (ref.current) ref.current.open = false;
                }}
            >
                {children}
            </div>
        </details>
    );
}