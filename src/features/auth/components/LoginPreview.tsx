const ROWS = [
    ['G', 'D/F#', 'Em7', 'Cadd9'],
    ['G', 'D', 'Em7', 'C'],
] as const;

export default function LoginPreview() {
    return (
        <div className="pv-window">
            <div className="pv-bar">
                <div className="pv-dots"><span /><span /><span /></div>
                <span className="pv-url">tu-equipo / canciones</span>
            </div>
            <div className="pv-body">
                <div className="pv-rail">
                    <span className="on" />
                    <span />
                    <span />
                    <span />
                </div>
                <div className="pv-main">
                    <div className="pv-title">Canción de ejemplo</div>
                    <div className="pv-chips">
                        <span className="pv-chip">Tono G</span>
                        <span className="pv-chip">72 BPM</span>
                        <span className="pv-chip">4/4</span>
                    </div>
                    <div className="pv-section">
                        <div className="pv-label">Verso 1</div>
                        <div className="pv-grid">
                            {ROWS.flat().map((chord, i) => (
                                <span key={i} className="pv-cell">{chord}</span>
                            ))}
                        </div>
                    </div>
                    <div className="pv-section">
                        <div className="pv-label">Coro</div>
                        <div className="pv-grid">
                            {['C', 'G', 'Am7', 'F'].map((chord, i) => (
                                <span key={i} className="pv-cell">{chord}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}