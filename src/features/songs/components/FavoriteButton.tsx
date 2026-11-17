import { LuHeart } from 'react-icons/lu';

interface FavoriteButtonProps {
    songId: string;
    isFavorite: boolean;
    action: (formData: FormData) => void | Promise<void>;
}

export default function FavoriteButton({ songId, isFavorite, action }: FavoriteButtonProps) {
    const label = isFavorite ? 'Quitar de guardadas' : 'Guardar canción';
    return (
        <form action={action}>
            <input type="hidden" name="songId" value={songId} />
            <button
                type="submit"
                className={`heart-btn${isFavorite ? ' is-on' : ''}`}
                aria-pressed={isFavorite}
                aria-label={label}
                title={label}
            >
                <LuHeart size={18} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
        </form>
    );
}