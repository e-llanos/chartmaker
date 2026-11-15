import { FaGithub } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import type { OAuthProvider } from '@/config/auth';

export default function ProviderIcon({ provider }: { provider: OAuthProvider }) {
    return provider === 'google'
        ? <FcGoogle size={20} aria-hidden="true" />
        : <FaGithub size={20} aria-hidden="true" />;
}