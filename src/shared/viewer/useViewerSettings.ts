'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import type { Notation } from '@/domain/music/engine';

export interface ViewerSettings {
    semitones: number;
    setSemitones: Dispatch<SetStateAction<number>>;
    notation: Notation;
    setNotation: Dispatch<SetStateAction<Notation>>;
}

/** Ajustes de transposición y notación. Cada visor puede usar los suyos o recibir los compartidos. */
export function useViewerSettings(): ViewerSettings {
    const [semitones, setSemitones] = useState<number>(0);
    const [notation, setNotation] = useState<Notation>('symbol');
    return { semitones, setSemitones, notation, setNotation };
}