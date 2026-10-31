import { SECTION_TYPES, SECTION_TYPE_KEYS, type SectionType } from '@/domain/sections/section-types';
import SectionBadge from '@/shared/viewer/SectionBadge';

interface SectionTypeButtonsProps {
  onAdd: (type: SectionType) => void;
  /** Solo las insignias, en una fila compacta. */
  compact?: boolean;
}

/** Botones "agregar sección" (Intro, Verso, Pre coro, Coro...). */
export default function SectionTypeButtons({ onAdd, compact = false }: SectionTypeButtonsProps) {
  if (compact) {
    return (
      <div className="section-add">
        {SECTION_TYPE_KEYS.map((type) => {
          const t = SECTION_TYPES[type];
          return (
            <button key={type} type="button" className="section-add-btn"
              onClick={() => onAdd(type)}
              aria-label={`Agregar ${t.label}`} title={`Agregar ${t.label}`}>
              <SectionBadge text={t.abbr} color={t.color} />
            </button>
          );
        })}
      </div>
    );
  }

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