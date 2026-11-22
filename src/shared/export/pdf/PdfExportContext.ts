'use client';

import { createContext } from 'react';

export const PdfExportContext = createContext<(() => void) | null>(null);