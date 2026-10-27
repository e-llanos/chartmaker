import Link from 'next/link';

interface EmptyResourceProps {
    title: string;
    description: string;
    href: string;
    cta: string;
}

export default function EmptyResource({ title, description, href, cta }: EmptyResourceProps) {
    return (
        <div className="empty-resource">
            <h2>{title}</h2>
            <p>{description}</p>
            <Link href={href} className="primary-btn">{cta}</Link>
        </div>
    );
}