import { createContext, type ReactNode } from 'react';

export interface SongMenu {
    edit: ReactNode;
    remove: ReactNode;
    file: ReactNode;
}

export const SongMenuContext = createContext<SongMenu | null>(null);