'use client';

import { createContext } from 'react';

export type ExportFormat = 'pdf' | 'png';

export const PdfExportContext = createContext<((format: ExportFormat) => void) | null>(null);