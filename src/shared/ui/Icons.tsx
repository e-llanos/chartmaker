import type { ReactNode } from 'react';

export function Icon({ children }: { children: ReactNode }) {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {children}
        </svg>
    );
}

export const ChevronDownIcon = () => <Icon><path d="m6 9 6 6 6-6" /></Icon>;
export const ChevronsUpIcon = () => <Icon><path d="m7 11 5-5 5 5M7 18l5-5 5 5" /></Icon>;
export const ChevronsDownIcon = () => <Icon><path d="m7 6 5 5 5-5M7 13l5 5 5-5" /></Icon>;
export const SparklesIcon = () => (
    <Icon><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16v4M17 18h4" /></Icon>
);
export const RepeatIcon = () => (
    <Icon>
        <path d="m17 2 4 4-4 4" />
        <path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4" />
        <path d="M21 13v2a3 3 0 0 1-3 3H3" />
    </Icon>
);
export const CopyIcon = () => (
    <Icon><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></Icon>
);
export const CloseIcon = () => <Icon><path d="M6 6l12 12M18 6 6 18" /></Icon>;
export const TrashIcon = () => (
    <Icon><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" /></Icon>
);
export const ArrowUpIcon = () => <Icon><path d="M12 19V5m-6 6 6-6 6 6" /></Icon>;
export const ArrowDownIcon = () => <Icon><path d="M12 5v14m6-6-6 6-6-6" /></Icon>;
export const ArrowLeftIcon = () => <Icon><path d="M19 12H5m6-6-6 6 6 6" /></Icon>;
export const ArrowRightIcon = () => <Icon><path d="M5 12h14m-6-6 6 6-6 6" /></Icon>;
export const PlusIcon = () => <Icon><path d="M12 5v14M5 12h14" /></Icon>;
export const MinusIcon = () => <Icon><path d="M5 12h14" /></Icon>;
export const GripIcon = () => (
    <Icon><path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" /></Icon>
);