/** "Ana Pérez Gómez" -> "AG"; "Ana" -> "A". */
export function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const picked = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
    return picked.map((p) => p?.[0] ?? '').join('').toUpperCase().slice(0, 2) || '?';
}