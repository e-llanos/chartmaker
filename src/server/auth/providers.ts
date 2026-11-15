import type { OAuthProvider } from '@/config/auth';

function credentials(prefix: 'GOOGLE') {
    const clientId = process.env[`${prefix}_CLIENT_ID`];
    const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];
    return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export const googleCredentials = () => credentials('GOOGLE');

/** Proveedores con sus dos variables configuradas. */
export function configuredProviders(): OAuthProvider[] {
    const found: OAuthProvider[] = [];
    if (googleCredentials()) found.push('google');
    return found;
}