/** Limpia espacios: "  Miel   San Marcos " -> "Miel San Marcos". */
export const cleanName = (text: string): string => text.trim().replace(/\s+/g, ' ');

/** Clave para comparar nombres: sin tildes, sin mayúsculas y con los espacios normalizados. */
export function nameKey(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}