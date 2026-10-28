'use client';

import type { Badge } from '@/domain/sections/section-types';
import SectionBadge from '@/shared/viewer/SectionBadge';

interface SectionNavProps {
  badges: Badge[];
  scopeId: string;
}

/** Fila superior de insignias: un clic lleva a la sección correspondiente. */
export default function SectionNav({ badges, scopeId }: SectionNavProps) {
  function goTo(id: Badge['id']) {
    document.getElementById(`${scopeId}-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (!badges.length) return null;
  return (
    <nav className="section-nav" aria-label="Secciones">
      {badges.map((b) => (
        <SectionBadge key={b.id} text={b.text} color={b.color} onClick={() => goTo(b.id)} label={`Ir a ${b.text}`} />
      ))}
    </nav>
  );
}