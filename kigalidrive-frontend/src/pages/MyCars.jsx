import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { carsAPI } from '../services/api';

const MyCars = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCar, setSelectedCar] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchMyCars();
    }, []);

    const fetchMyCars = async () => {
        try {
            setLoading(true);
            const res = await carsAPI.getMyCars();
            setCars(res.data);
        } catch (error) {
            console.error('Failed to fetch cars', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            Pending: 'badge-warning',
            Approved: 'badge-success',
            Rejected: 'badge-error',
        };
        return styles[status] || 'badge-info';
    };

    const handleView = (car) => {
        setSelectedCar(car);
        setShowModal(true);
    };

    const handleEdit = (carId) => {
        navigate(`/my-cars/${carId}/edit`);
    };

    const handleDelete = async (carId) => {
        if (!window.confirm('Are you sure you want to delete this car?')) return;
        try {
            await carsAPI.delete(carId);
            setCars(cars.filter(c => c.id !== carId));
        } catch (error) {
            alert('Failed to delete car');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>My Cars</h1>
                    <p style={{ color: 'var(--color-gray-400)' }}>Manage your vehicle listings</p>
                </div>
                <Link to="/my-cars/add" className="btn btn-primary">
                    + Add New Car
                </Link>
            </div>

            {cars.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🚗</div>
                    <h3 className="empty-state-title">No cars listed yet</h3>
                    <p>Start earning by listing your first car!</p>
                    <Link to="/my-cars/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        + List Your First Car
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '1.5rem' }}>
                    {cars.map((car) => (
                        <div key={car.id} className="card">
                            <div
                                style={{
                                    height: '150px',
                                    background: car.imageUrl && car.imageUrl.startsWith('data:')
                                        ? `url(${car.imageUrl}) center/cover`
                                        : 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem'
                                }}
                            >
                                {(!car.imageUrl || !car.imageUrl.startsWith('data:')) && '🚗'}
                            </div>

                            <h3>{car.year} {car.make} {car.model}</h3>
                            <p style={{ color: 'var(--color-gray-400)', marginBottom: '0.5rem' }}>
                                {car.licensePlate} • {car.transmission} • {car.seats} seats
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-accent)' }}>
                                    ${car.pricePerDay}/day
                                </span>
                                <span className={`badge ${getStatusBadge(car.approvalStatus)}`}>
                                    {car.approvalStatus}
                                </span>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    style={{ flex: 1 }}
                                    onClick={() => handleEdit(car.id)}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-primary"
                                    style={{ flex: 1 }}
                                    onClick={() => handleView(car)}
                                >
                                    👁️ View
                                </button>
                            </div>
                            <button
                                className="btn btn-sm btn-ghost"
                                style={{ width: '100%', marginTop: '0.5rem', color: 'var(--color-error)' }}
                                onClick={() => handleDelete(car.id)}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* View Modal */}
            {showModal && selectedCar && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="card"
                        style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2>{selectedCar.year} {selectedCar.make} {selectedCar.model}</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'white' }}
                            >
                                ✕
                            </button>
                        </div>

                        {selectedCar.imageUrl && selectedCar.imageUrl.startsWith('data:') && (
                            <img
                                src={selectedCar.imageUrl}
                                alt={`${selectedCar.make} ${selectedCar.model}`}
                                style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '1rem' }}
                            />
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>License Plate</p>
                                <p style={{ fontWeight: '600' }}>{selectedCar.licensePlate}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>Color</p>
                                <p style={{ fontWeight: '600' }}>{selectedCar.color || 'N/A'}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>Transmission</p>
                                <p style={{ fontWeight: '600' }}>{selectedCar.transmission}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>Fuel Type</p>
                                <p style={{ fontWeight: '600' }}>{selectedCar.fuelType}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>Seats</p>
                                <p style={{ fontWeight: '600' }}>{selectedCar.seats}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>Price Per Day</p>
                                <p style={{ fontWeight: '600', color: 'var(--color-accent)' }}>${selectedCar.pricePerDay}</p>
                            </div>
                        </div>

                        {selectedCar.description && (
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>Description</p>
                                <p>{selectedCar.description}</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className={`badge ${getStatusBadge(selectedCar.approvalStatus)}`}>
                                {selectedCar.approvalStatus}
                            </span>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setShowModal(false);
                                    handleEdit(selectedCar.id);
                                }}
                            >
                                ✏️ Edit Car
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCars;
