/** Identificador corto para secciones creadas en el cliente. */
export function newId(): string {
    return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
