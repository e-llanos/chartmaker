import { SECTION_TYPES, SECTION_TYPE_KEYS, type SectionType } from '@/domain/sections/section-types';
import SectionBadge from './SectionBadge';

interface SectionTypeButtonsProps {
  onAdd: (type: SectionType) => void;
}

/** Botones "agregar sección" (Intro, Verso, Pre coro, Coro...) de ambos editores. */
export default function SectionTypeButtons({ onAdd }: SectionTypeButtonsProps) {
  return (
    <div className="section-buttons">
      {SECTION_TYPE_KEYS.map((type) => {
        const t = SECTION_TYPES[type];
        return (
          <button key={type} type="button" className="section-btn" onClick={() => onAdd(type)}>
            <SectionBadge text={t.abbr} color={t.color} small />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}