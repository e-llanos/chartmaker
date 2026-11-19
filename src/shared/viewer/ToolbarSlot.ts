'use client';

import { createContext } from 'react';

/**
 * Dónde dibuja el visor su barra de controles:
 * - `undefined`: en línea, sobre la hoja (editor y vistas previas).
 * - `HTMLElement`: dentro de ese nodo (la cabecera de la canción).
 * - `null`: en ningún sitio todavía (pestaña inactiva o cabecera aún sin montar).
 */
export const ToolbarSlotContext = createContext<HTMLElement | null | undefined>(undefined);