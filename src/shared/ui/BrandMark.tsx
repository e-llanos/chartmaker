import Image from 'next/image';

/** Logo provisional: el favicon de la app, hasta tener un logo definitivo. */
export default function BrandMark({ size = 32 }: { size?: number }) {
    return <Image src="/favicon.ico" alt="" width={size} height={size} unoptimized className="brand-mark" />;
}