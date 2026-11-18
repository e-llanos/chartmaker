import { LuSearch } from 'react-icons/lu';

interface SearchBarProps {
    defaultValue?: string;
    placeholder: string;
    /** Parámetros que se conservan al buscar (pestaña, vista, orden…). */
    keep?: Record<string, string>;
    variant?: 'pill' | 'compact';
}

export default function SearchBar({ defaultValue = '', placeholder, keep = {}, variant = 'pill' }: SearchBarProps) {
    return (
        <form className={`search-bar is-${variant}`} action="/songs" method="get" role="search">
            {Object.entries(keep).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
            ))}
            <input
                type="search"
                name="q"
                defaultValue={defaultValue}
                placeholder={placeholder}
                aria-label={placeholder}
                autoComplete="off"
                maxLength={100}
            />
            <button type="submit" aria-label="Buscar">
                <LuSearch size={variant === 'pill' ? 24 : 18} aria-hidden="true" />
            </button>
        </form>
    );
}