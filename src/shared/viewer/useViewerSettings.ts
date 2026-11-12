'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import type { KeyReference } from '@/domain/music/core/analysis';
import type { Notation } from '@/domain/music/notation/engine';

export interface ViewerSettings {
    semitones: number;
    setSemitones: Dispatch<SetStateAction<number>>;
    notation: Notation;
    setNotation: Dispatch<SetStateAction<Notation>>;
    /** Desde dónde se numeran los acordes en Nashville y romanos (solo cambia en tonalidades menores). */
    reference: KeyReference;
    setReference: Dispatch<SetStateAction<KeyReference>>;
}

/** Ajustes de transposición, notación y referencia de la numeración. Cada visor puede usar los suyos o recibir los compartidos. */
export function useViewerSettings(): ViewerSettings {
    const [semitones, setSemitones] = useState<number>(0);
    const [notation, setNotation] = useState<Notation>('symbol');
    const [reference, setReference] = useState<KeyReference>('tonic');
    return { semitones, setSemitones, notation, setNotation, reference, setReference };
}