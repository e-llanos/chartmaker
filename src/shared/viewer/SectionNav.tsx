'use client';

import { useEffect, useRef, useState } from 'react';
import type { Badge } from '@/domain/sections/section-types';
import SectionBadge from '@/shared/viewer/SectionBadge';

interface SectionNavProps {
  badges: Badge[];
  scopeId: string;
}

/**
 * Fila de insignias: un clic lleva a la sección. Mientras se baja por la página resalta la sección
 * que se está leyendo y desliza la fila para mantener su insignia a la vista.
 */
export default function SectionNav({ badges, scopeId }: SectionNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<Badge['id'] | null>(null);

  // Sección actual: la última cuyo borde superior ya pasó por debajo de esta barra.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || badges.length === 0) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (nav.getClientRects().length === 0) return; // panel oculto (otra pestaña)
      const line = nav.getBoundingClientRect().bottom + 16;
      let current = badges[0]!.id;
      let best = -Infinity;
      for (const b of badges) {
        const el = document.getElementById(`${scopeId}-${b.id}`);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= line && top > best) {
          best = top;
          current = b.id;
        }
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [badges, scopeId]);

  // Desliza la fila para centrar la insignia activa.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || active === null || nav.scrollWidth <= nav.clientWidth) return;
    const index = badges.findIndex((b) => b.id === active);
    const el = nav.children[index] as HTMLElement | undefined;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    nav.scrollTo({
      left: el.offsetLeft - (nav.clientWidth - el.offsetWidth) / 2,
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, [active, badges]);

  function goTo(id: Badge['id']) {
    document.getElementById(`${scopeId}-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (!badges.length) return null;
  return (
    <nav ref={navRef} className="section-nav" aria-label="Secciones">
      {badges.map((b) => (
        <SectionBadge
          key={b.id}
          text={b.text}
          color={b.color}
          active={b.id === active}
          onClick={() => goTo(b.id)}
          label={`Ir a ${b.text}`}
        />
      ))}
    </nav>
  );
}