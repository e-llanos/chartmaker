import Link from 'next/link';

interface EmptyStateProps {
    title: string;
    description: string;
    href: string;
    cta: string;
}

export default function EmptyState({ title, description, href, cta }: EmptyStateProps) {
    return (
        <div className="empty-resource">
            <h2>{title}</h2>
            <p>{description}</p>
            <Link href={href} className="primary-btn">{cta}</Link>
        </div>
    );
}