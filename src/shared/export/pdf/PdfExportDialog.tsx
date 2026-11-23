'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
    LuBold, LuContrast, LuDownload, LuEye, LuFileText, LuMinus, LuPalette, LuPlus,
    LuRotateCcw, LuRuler, LuSlidersHorizontal, LuType, LuX, LuImage,
} from 'react-icons/lu';
import Select from '@/shared/ui/Select';
import type { PdfExport } from './pdf-export';
import { PDF_FONTS } from './pdf-fonts';
import { CHORD_COLORS } from './pdf-options';
import PdfPreview from './PdfPreview';
import { usePdfOptions } from './usePdfOptions';
import { downloadBlob } from '@/shared/export/export-sheet';
import type { ExportFormat } from './PdfExportContext';
import { pdfToPng } from './pdf-image';

interface PdfExportDialogProps {
    pdf: PdfExport;
    format: ExportFormat;
    open: boolean;
    onClose: () => void;
}

export default function PdfExportDialog({ pdf, format, open, onClose }: PdfExportDialogProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const d = ref.current;
        if (!d) return;
        if (open && !d.open) d.showModal();
        if (!open && d.open) d.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            className="pdf-dialog"
            aria-label="Exportar PDF"
            onClose={onClose}
            onClick={(e) => { if (e.target === ref.current) onClose(); }}
        >
            {open && <PdfPanel pdf={pdf} format={format} onClose={onClose} />}
        </dialog>
    );
}

const FONT_OPTIONS = PDF_FONTS.map((f) => ({ value: f.id, label: f.label }));

const WIDE = '(min-width: 900px)';
function useWide(): boolean {
    return useSyncExternalStore(
        (notify) => {
            const mq = window.matchMedia(WIDE);
            mq.addEventListener('change', notify);
            return () => mq.removeEventListener('change', notify);
        },
        () => window.matchMedia(WIDE).matches,
        () => false
    );
}

function PdfPanel({ pdf, format, onClose }: Omit<PdfExportDialogProps, 'open'>) {
    const { options, update, reset } = usePdfOptions();
    const wide = useWide();
    const [view, setView] = useState<'options' | 'preview'>('options');
    const [busy, setBusy] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const error = downloadError ?? previewError;

    async function download() {
        setBusy(true);
        setDownloadError(null);
        try {
            const doc = await pdf.render(options);
            if (format === 'png') downloadBlob(await pdfToPng(doc), `${pdf.filename}.png`);
            else doc.save(`${pdf.filename}.pdf`);
            onClose();
        } catch (e) {
            setDownloadError(e instanceof Error ? e.message : 'No se pudo exportar');
        } finally {
            setBusy(false);
        }
    }

    const showForm = wide || view === 'options';
    const showPreview = wide || view === 'preview';

    return (
        <>
            <header className="pdf-head">
                <span className="pdf-head-icon" aria-hidden="true"><LuFileText size={18} /></span>
                <h2>{format === 'png' ? 'Exportar imagen' : 'Exportar PDF'}</h2>
                <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
                    <LuX size={18} aria-hidden="true" />
                </button>
            </header>

            {!wide && (
                <div className="pdf-tabs" role="tablist" aria-label="Sección">
                    <button type="button" role="tab" aria-selected={view === 'options'} onClick={() => setView('options')}>
                        <LuSlidersHorizontal size={15} aria-hidden="true" /> Opciones
                    </button>
                    <button type="button" role="tab" aria-selected={view === 'preview'} onClick={() => setView('preview')}>
                        <LuEye size={15} aria-hidden="true" /> Vista previa
                    </button>
                </div>
            )}

            <div className="pdf-body">
                <div className={`pdf-form${showForm ? '' : ' is-hidden'}`}>
                    <Group icon={LuType} title="Tipografía">
                        <Field label="Letra y títulos">
                            <Select value={options.textFont} options={FONT_OPTIONS} label="Tipografía de la letra"
                                onChange={(v) => update({ textFont: v })} />
                        </Field>
                        <Field label="Acordes">
                            <div className="pdf-inline">
                                <Select value={options.chordFont} options={FONT_OPTIONS} label="Tipografía de los acordes"
                                    onChange={(v) => update({ chordFont: v })} />
                                <button type="button" className="pdf-iconbtn" aria-pressed={options.chordBold}
                                    aria-label="Acordes en negrita" title="Acordes en negrita"
                                    onClick={() => update({ chordBold: !options.chordBold })}>
                                    <LuBold size={16} aria-hidden="true" />
                                </button>
                            </div>
                        </Field>
                        <Toggle label="Título en mayúsculas" checked={options.titleUppercase}
                            onChange={(v) => update({ titleUppercase: v })} />
                        <Toggle label="Secciones en mayúsculas" checked={options.sectionUppercase}
                            onChange={(v) => update({ sectionUppercase: v })} />
                    </Group>

                    <Group icon={LuRuler} title="Tamaños">
                        <div className="pdf-sizes">
                            <Size label="Título" value={options.titleSize} min={16} max={40}
                                onChange={(v) => update({ titleSize: v })} />
                            <Size label="Letra" value={options.textSize} min={8} max={18}
                                onChange={(v) => update({ textSize: v })} />
                            <Size label="Acordes" value={options.chordSize} min={8} max={18}
                                onChange={(v) => update({ chordSize: v })} />
                        </div>
                    </Group>

                    <Group icon={LuFileText} title="Página">
                        <div className="pdf-pair">
                            <Field label="Papel">
                                <Segmented value={options.paper} label="Papel"
                                    options={[{ value: 'a4', label: 'A4' }, { value: 'letter', label: 'Carta' }]}
                                    onChange={(v) => update({ paper: v })} />
                            </Field>
                            <Field label="Columnas">
                                <Segmented value={options.columns} label="Columnas"
                                    options={[
                                        { value: 'auto', label: 'Auto', title: 'Según la vista del visor' },
                                        { value: 1, label: '1' },
                                        { value: 2, label: '2' },
                                    ]}
                                    onChange={(v) => update({ columns: v })} />
                            </Field>
                        </div>
                        <Field label="Márgenes">
                            <Segmented value={options.margin} label="Márgenes"
                                options={[
                                    { value: 'narrow', label: 'Estrechos' },
                                    { value: 'normal', label: 'Normales' },
                                    { value: 'wide', label: 'Amplios' },
                                ]}
                                onChange={(v) => update({ margin: v })} />
                        </Field>
                        <Field label="Espaciado">
                            <Segmented value={options.spacing} label="Espaciado"
                                options={[
                                    { value: 'compact', label: 'Compacto' },
                                    { value: 'normal', label: 'Normal' },
                                    { value: 'relaxed', label: 'Amplio' },
                                ]}
                                onChange={(v) => update({ spacing: v })} />
                        </Field>
                        <Toggle label="No partir secciones" checked={options.keepTogether}
                            onChange={(v) => update({ keepTogether: v })} />
                        <Toggle label="Numerar páginas" checked={options.pageNumbers}
                            onChange={(v) => update({ pageNumbers: v })} />
                    </Group>

                    <Group icon={LuPalette} title="Colores">
                        <Segmented value={options.color ? 'color' : 'bw'} label="Modo de color"
                            options={[
                                { value: 'color', label: 'Color', icon: <LuPalette size={15} aria-hidden="true" /> },
                                { value: 'bw', label: 'Blanco y negro', icon: <LuContrast size={15} aria-hidden="true" /> },
                            ]}
                            onChange={(v) => update({ color: v === 'color' })} />
                        {options.color && (
                            <Row label="Color de los acordes">
                                <div className="pdf-swatches" role="radiogroup" aria-label="Color de los acordes">
                                    {CHORD_COLORS.map((c) => (
                                        <button key={c.value} type="button" role="radio"
                                            aria-checked={options.chordColor === c.value} aria-label={c.label} title={c.label}
                                            className={options.chordColor === c.value ? 'is-on' : ''}
                                            style={{ background: c.value }}
                                            onClick={() => update({ chordColor: c.value })} />
                                    ))}
                                </div>
                            </Row>
                        )}
                    </Group>
                </div>

                {/* Siempre montada: al cambiar de pestaña en móvil conserva las páginas ya dibujadas. */}
                <div className={`pdf-preview-wrap${showPreview ? '' : ' is-hidden'}`}>
                    <PdfPreview pdf={pdf} options={options} active={showPreview} onError={setPreviewError} />
                </div>
            </div>

            <footer className="pdf-foot">
                {error && <p role="alert" className="form-error pdf-error">{error}</p>}
                <button type="button" className="pdf-reset" onClick={reset}>
                    <LuRotateCcw size={15} aria-hidden="true" /> Restablecer
                </button>
                <button type="button" className="primary-btn pdf-download" onClick={download} disabled={busy}>
                    {format === 'png' ? <LuImage size={16} aria-hidden="true" /> : <LuDownload size={16} aria-hidden="true" />}
                    {busy ? 'Generando…' : format === 'png' ? 'Descargar imagen' : 'Descargar PDF'}
                </button>
            </footer>
        </>
    );
}

/* ---------- Estructura ---------- */

function Group({ icon: Icon, title, children }: { icon: IconType; title: string; children: ReactNode }) {
    return (
        <section className="pdf-group">
            <h3><Icon size={15} aria-hidden="true" /> {title}</h3>
            <div className="pdf-card">{children}</div>
        </section>
    );
}

/** Etiqueta a la izquierda y control a la derecha. */
function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="pdf-row">
            <span className="pdf-label">{label}</span>
            {children}
        </div>
    );
}

/** Etiqueta arriba y control a todo el ancho. */
function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="pdf-field">
            <span className="pdf-label">{label}</span>
            {children}
        </div>
    );
}

/* ---------- Controles ---------- */

function Segmented<T extends string | number>({ value, options, onChange, label }: {
    value: T;
    options: Array<{ value: T; label: string; icon?: ReactNode; title?: string }>;
    onChange: (v: T) => void;
    label: string;
}) {
    return (
        <div className="pdf-seg" role="radiogroup" aria-label={label}>
            {options.map((o) => (
                <button key={String(o.value)} type="button" role="radio" aria-checked={o.value === value}
                    title={o.title} className={o.value === value ? 'is-on' : ''} onClick={() => onChange(o.value)}>
                    {o.icon}
                    {o.label}
                </button>
            ))}
        </div>
    );
}

function Size({ label, value, min, max, onChange }: {
    label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
    return (
        <div className="pdf-size">
            <span className="pdf-label">{label}</span>
            <div className="pdf-step" role="group" aria-label={`Tamaño: ${label}`}>
                <button type="button" aria-label="Disminuir" disabled={value <= min} onClick={() => onChange(value - 1)}>
                    <LuMinus size={14} aria-hidden="true" />
                </button>
                <output>{value}<small>pt</small></output>
                <button type="button" aria-label="Aumentar" disabled={value >= max} onClick={() => onChange(value + 1)}>
                    <LuPlus size={14} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="pdf-toggle">
            <span>{label}</span>
            <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} />
        </label>
    );
}