'use client';

import { useCallback } from 'react';
import { transposeKey } from '@/domain/music/core/transpose';
import { convertChordString, transposeChordString } from '@/domain/music/engine';
import { useViewerSettings, type ViewerSettings } from './useViewerSettings';

/** Usa los ajustes compartidos si se pasan; si no, unos propios del visor. */
export function useResolvedSettings(shared?: ViewerSettings): ViewerSettings {
    const local = useViewerSettings();
    return shared ?? local;
}

/** Tonalidad mostrada y función que transpone y convierte cada acorde a la notación elegida. */
export function useChordMapper(originalKey: string, { semitones, notation }: ViewerSettings) {
    const displayKey = semitones ? (transposeKey(originalKey, semitones) ?? originalKey) : originalKey;

    const mapChord = useCallback(
        (chord: string): string =>
            convertChordString(
                transposeChordString(chord, semitones, 'symbol', originalKey),
                notation,
                displayKey
            ),
        [semitones, notation, originalKey, displayKey]
    );

    return { displayKey, mapChord };
}
