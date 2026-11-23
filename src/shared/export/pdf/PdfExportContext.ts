import { createContext } from 'react';

export type ExportFormat = 'pdf' | 'png';

/** Abre el panel de exportación (PDF e imagen se eligen dentro). */
export const PdfExportContext = createContext<(() => void) | null>(null);