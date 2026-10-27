export default function ViewSkeleton() {
    return (
        <div className="view-skeleton" aria-busy="true" aria-label="Cargando">
            <div className="skeleton skeleton-bar" />
            <div className="skeleton-grid">
                <div className="skeleton skeleton-card" />
                <div className="skeleton skeleton-card" />
            </div>
        </div>
    );
}