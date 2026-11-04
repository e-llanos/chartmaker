import { Icon } from '@/shared/ui/Icons';

export const PianoIcon = () => (
    <Icon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M9 19v-5M15 19v-5M7 5v6h4V5M13 5v6h4V5" /></Icon>
);

/** Mástil visto de frente: trastes y cuerdas. */
export const GuitarIcon = () => (
    <Icon><rect x="3" y="6" width="18" height="12" rx="1.5" /><path d="M8 6v12M13 6v12M3 10h18M3 14h18" /></Icon>
);

export const NoteIcon = () => (
    <Icon><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></Icon>
);

export const ScaleIcon = () => <Icon><path d="M4 20h4v-4h4v-4h4V8h4" /></Icon>;

export const ChordIcon = () => (
    <Icon><circle cx="12" cy="5.5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="18.5" r="2" /></Icon>
);

export const BanIcon = () => <Icon><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></Icon>;

export const EyeIcon = () => (
    <Icon><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icon>
);

export const EyeOffIcon = () => (
    <Icon>
        <path d="M3 3l18 18" />
        <path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6 0 10 7 10 7a16 16 0 0 1-3.2 4M6.5 6.6A16.5 16.5 0 0 0 2 12s4 7 10 7a9.6 9.6 0 0 0 4-.9" />
    </Icon>
);

export const SunIcon = () => (
    <Icon>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
);

export const MoonIcon = () => <Icon><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" /></Icon>;

export const LayersIcon = () => <Icon><path d="M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5" /></Icon>;

export const SlidersIcon = () => (
    <Icon>
        <path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0" />
        <circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="18" r="2" />
    </Icon>
);