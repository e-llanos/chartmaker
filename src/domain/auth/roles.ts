export const ROLES = ['admin', 'leader', 'musician'] as const;
export type Role = (typeof ROLES)[number];

/** Rol de quien se registra por primera vez. */
export const DEFAULT_ROLE: Role = 'musician';

export const ROLE_LABELS: Record<Role, string> = {
    admin: 'Administrador',
    leader: 'Líder',
    musician: 'Músico',
};

export const isRole = (value: unknown): value is Role =>
    typeof value === 'string' && (ROLES as readonly string[]).includes(value);

/** Un valor desconocido o ausente cuenta como el rol por defecto. */
export const toRole = (value: unknown): Role => (isRole(value) ? value : DEFAULT_ROLE);

export type Permission = 'song:create' | 'song:update' | 'song:delete' | 'song:export' | 'user:manage';

/** Qué puede hacer cada rol. Para cambiar una regla, edita esta tabla. */
const PERMISSIONS: Record<Role, readonly Permission[]> = {
    admin: ['song:create', 'song:update', 'song:delete', 'song:export', 'user:manage'],
    leader: ['song:create', 'song:update', 'song:delete'],
    musician: [],
};

export function can(role: Role | null | undefined, permission: Permission): boolean {
    return role ? PERMISSIONS[role].includes(permission) : false;
}