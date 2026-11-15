import { toNextJsHandler } from 'better-auth/next-js';
import { getAuth } from '@/server/auth/auth';

// La instancia de auth se crea al primer uso para que `next build` no exija variables de entorno.
export function GET(request: Request) {
    return toNextJsHandler(getAuth()).GET(request);
}

export function POST(request: Request) {
    return toNextJsHandler(getAuth()).POST(request);
}