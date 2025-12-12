const CarCard = ({ car, onBook, onEdit, onDelete, showActions = false, isOwner = false }) => {
    return (
        <div className="car-card">
            <img
                src={car.imageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'}
                alt={`${car.make} ${car.model}`}
                className="car-card-image"
                onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400';
                }}
            />
            <div className="car-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className="car-card-title">{car.year} {car.make} {car.model}</h3>
                    <span className={`badge ${car.status === 'Available' ? 'badge-success' : 'badge-warning'}`}>
                        {car.status}
                    </span>
                </div>

                <div className="car-card-price">
                    ${car.pricePerDay}<span>/day</span>
                </div>

                <div className="car-card-features">
                    <span>🪑 {car.seats} Seats</span>
                    <span>⚙️ {car.transmission}</span>
                    <span>⛽ {car.fuelType}</span>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {onBook && car.status === 'Available' && (
                        <button onClick={() => onBook(car)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                            Book Now
                        </button>
                    )}
                    {showActions && isOwner && (
                        <>
                            <button onClick={() => onEdit(car)} className="btn btn-secondary btn-sm">
                                Edit
                            </button>
                            <button onClick={() => onDelete(car.id)} className="btn btn-ghost btn-sm">
                                🗑️
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CarCard;
