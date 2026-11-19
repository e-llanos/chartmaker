import type { IconType } from 'react-icons';
import { LuBookOpen, LuCircleHelp, LuHouse, LuListMusic, LuSlidersHorizontal } from 'react-icons/lu';
import type { RailIconName } from '@/config/nav';

export const NAV_ICONS: Record<RailIconName, IconType> = {
    home: LuHouse,
    songs: LuListMusic,
    theory: LuBookOpen,
    settings: LuSlidersHorizontal,
    help: LuCircleHelp,
};
