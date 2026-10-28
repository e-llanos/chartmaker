import type { SectionType } from '@/domain/sections/section-types';

export interface ChartMeasure {
    beats: string[];
    repeat?: number;
}

export interface ChartSection {
    id: string;
    type: SectionType;
    label: string;
    note: string;
    repeat: number;
    measures: ChartMeasure[];
}

export interface Chart {
    sections: ChartSection[];
}