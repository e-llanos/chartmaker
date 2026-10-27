import { cacheLife } from 'next/cache';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/config';

export default async function Footer() {
    'use cache';
    cacheLife('days');

    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-inner">
                <span>© {year} {APP_NAME}</span>
                <span>{APP_DESCRIPTION}</span>
            </div>
        </footer>
    );
}