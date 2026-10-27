import type { CSSProperties, MouseEventHandler } from 'react';

/** Insignia circular de sección (I, V1, Pr, C...). Es botón si recibe onClick. */
export default function SectionBadge({
  text,
  color,
  small = false,
  onClick,
  label,
}: {
  text: string;
  color: string;
  small?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  label?: string;
}) {
  const cls = `badge${small ? ' badge-sm' : ''}`;
  const style: CSSProperties & { '--c': string } = { '--c': color };
  return onClick ? (
    <button type="button" className={cls} style={style} onClick={onClick} aria-label={label || text}>
      {text}
    </button>
  ) : (
    <span className={cls} style={style}>{text}</span>
  );
}
