'use client';

import { useState, useSyncExternalStore, type Dispatch, type SetStateAction } from 'react';
import type { KeyReference } from '@/domain/music/core/analysis';
import type { Notation } from '@/domain/music/notation/engine';

/** Tamaño del texto en porcentaje (100 = normal). */
export const FONT_DEFAULT = 100;
export const FONT_MIN = 70;
export const FONT_MAX = 200;
export const FONT_STEP = 10;
const FONT_KEY = 'chartmaker:viewer-font';

function clampFont(percent: number): number {
    const stepped = Math.round(percent / FONT_STEP) * FONT_STEP;
    return Math.min(FONT_MAX, Math.max(FONT_MIN, stepped));
}

// El tamaño se recuerda en el navegador y es el mismo en todas las canciones y pestañas.
// `useSyncExternalStore` evita diferencias de hidratación: el servidor siempre pinta 100 %.
const fontListeners = new Set<() => void>();
let fontCache: number | null = null;

function readFont(): number {
    if (fontCache === null) {
        try {
            const raw = window.localStorage.getItem(FONT_KEY);
            fontCache = raw === null ? FONT_DEFAULT : clampFont(Number(raw) || FONT_DEFAULT);
        } catch {
            fontCache = FONT_DEFAULT;
        }
    }
    return fontCache;
}

function subscribeFont(onChange: () => void): () => void {
    const onStorage = (e: StorageEvent) => {
        if (e.key !== FONT_KEY) return;
        fontCache = null; // otra pestaña lo cambió: se vuelve a leer
        onChange();
    };
    fontListeners.add(onChange);
    window.addEventListener('storage', onStorage);
    return () => {
        fontListeners.delete(onChange);
        window.removeEventListener('storage', onStorage);
    };
}

function writeFont(percent: number): void {
    fontCache = clampFont(percent);
    try {
        window.localStorage.setItem(FONT_KEY, String(fontCache));
    } catch {
        /* sin almacenamiento: el cambio dura hasta recargar */
    }
    fontListeners.forEach((notify) => notify());
}

export interface ViewerSettings {
    semitones: number;
    setSemitones: Dispatch<SetStateAction<number>>;
    notation: Notation;
    setNotation: Dispatch<SetStateAction<Notation>>;
    /** Desde dónde se numeran los acordes en Nashville y romanos (solo cambia en tonalidades menores). */
    reference: KeyReference;
    setReference: Dispatch<SetStateAction<KeyReference>>;
    /** Tamaño del texto de la hoja, en porcentaje. */
    fontPercent: number;
    setFontPercent: (percent: number) => void;
}

/** Ajustes de transposición, notación, referencia y tamaño del texto. Cada visor puede usar los suyos o recibir los compartidos. */
export function useViewerSettings(): ViewerSettings {
    const [semitones, setSemitones] = useState<number>(0);
    const [notation, setNotation] = useState<Notation>('symbol');
    const [reference, setReference] = useState<KeyReference>('tonic');
    const fontPercent = useSyncExternalStore(subscribeFont, readFont, () => FONT_DEFAULT);
    return {
        semitones, setSemitones, notation, setNotation, reference, setReference,
        fontPercent, setFontPercent: writeFont,
    };
}