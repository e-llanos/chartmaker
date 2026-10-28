import type { ReactNode } from 'react';

interface EditorLayoutProps {
  tools: ReactNode;
  preview: ReactNode;
}

/**
 * Disposición común de los dos editores:
 * izquierda = herramientas de edición, derecha = visualizador en vivo.
 */
export default function EditorLayout({ tools, preview }: EditorLayoutProps) {
  return (
    <div className="editor-layout">
      <aside className="editor-tools" aria-label="Herramientas de edición">{tools}</aside>
      <section className="editor-preview" aria-label="Vista previa">{preview}</section>
    </div>
  );
}