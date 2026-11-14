/** Lo mínimo que se usa de un fallo de Zod (sirve igual para las versiones 3 y 4). */
export interface Issue {
    path: ReadonlyArray<PropertyKey>;
    message: string;
    code?: string;
    expected?: unknown;
}

const TYPE_NAMES: Record<string, string> = {
    string: 'texto',
    number: 'un número',
    boolean: 'verdadero o falso',
    object: 'un objeto',
    array: 'una lista',
};

/** Los límites ya traen su mensaje en el esquema; aquí se traducen los fallos de tipo y se indica la ruta. */
export function describeIssue(issue: Issue, inChart: boolean): string {
    const path = issue.path.map(String);
    const field = (inChart && path[0] === 'chart' ? path.slice(1) : path).join('.');
    const detail =
        issue.code === 'invalid_type'
            ? `debe ser ${TYPE_NAMES[String(issue.expected)] ?? String(issue.expected)}`
            : issue.message;

    if (inChart) return field ? `Chart inválido (${field}): ${detail}` : 'Chart inválido';
    if (issue.code === 'invalid_type') return field ? `"${field}" ${detail}` : 'JSON inválido';
    return issue.message;
}