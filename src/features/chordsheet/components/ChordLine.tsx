import type { Token } from '@/domain/chordsheet/parse-sections';
import type { ViewMode } from '@/domain/chordsheet/view-mode';
import ChordText from '@/shared/viewer/ChordText';

interface ChordLineProps {
    tokens: Token[];
    mapChord: (chord: string) => string;
    mode?: ViewMode;
}

/** Una línea del cifrado: cada acorde queda sobre el texto que le sigue. */
export default function ChordLine({ tokens, mapChord, mode = 'full' }: ChordLineProps) {
    const hasChords = tokens.some((t) => t.chord);
    const lyric = tokens.map((t) => t.text).join('');
    const hasLyrics = lyric.trim() !== '';

    if (mode === 'lyrics') {
        if (!hasLyrics) return null;
        return (
            <div className="chord-line lyrics-only">
                <span className="ly">{lyric}</span>
            </div>
        );
    }

    if (mode === 'chords') {
        if (!hasChords) return null;
        return (
            <div className="chord-line chords-only">
                {tokens.map((t, i) =>
                    t.chord ? (
                        <span className="tk" key={i}>
                            <span className="ch"><ChordText chord={mapChord(t.chord)} /></span>
                        </span>
                    ) : null
                )}
            </div>
        );
    }

    const onlyChords = hasChords && !hasLyrics;
    return (
        <div className={`chord-line${onlyChords ? ' chords-only' : ''}`}>
            {tokens.map((t, i) => (
                <span className="tk" key={i}>
                    {hasChords && (
                        <span className="ch">{t.chord ? <ChordText chord={mapChord(t.chord)} /> : '\u00A0'}</span>
                    )}
                    {!onlyChords && <span className="ly">{t.text}</span>}
                </span>
            ))}
        </div>
    );
}