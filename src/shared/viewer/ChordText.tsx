import { splitChord } from '@/domain/music/notation/format-chord';

interface ChordTextProps {
  chord: string;
}

/** Acorde con extensiones en superíndice: F<sup>sus2</sup>, Am<sup>7</sup>. */
export default function ChordText({ chord }: ChordTextProps) {
  const { base, sup, bass } = splitChord(chord);
  return (
    <span className="chord">
      {base}
      {sup && <sup>{sup}</sup>}
      {bass}
    </span>
  );
}