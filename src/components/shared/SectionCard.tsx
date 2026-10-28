'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { Badge } from '@/domain/sections/section-types';
import SectionBadge from './SectionBadge';

interface SectionCardProps {
  domId: string;
  badge: Badge;
  label: string;
  note?: string;
  highlighted: boolean;
  onToggleHighlight: () => void;
  children?: ReactNode;
  repeat?: number;
}

/**
 * Tarjeta de sección: insignia + nombre a la izquierda, anotación a la
 * derecha. Al hacer clic en el encabezado se subraya (resalta) la sección.
 */
export default function SectionCard({
  domId, badge, label, note, repeat = 1, highlighted, onToggleHighlight, children,
}: SectionCardProps) {
  return (
    <section
      id={domId}
      data-export-block
      className={`section-card${highlighted ? ' highlighted' : ''}`}
      style={{ '--c': badge.color } as CSSProperties}
    >
      <button type="button" className="section-head" onClick={onToggleHighlight} aria-pressed={highlighted}>
        <SectionBadge text={badge.text} color={badge.color} small />
        <span className="section-name">{label}</span>
        {repeat > 1 && <span className="section-repeat" title={`Se repite ${repeat} veces`}>×{repeat}</span>}
        {note && <span className="section-note">{note}</span>}
      </button>
      {children}
    </section>
  );
}