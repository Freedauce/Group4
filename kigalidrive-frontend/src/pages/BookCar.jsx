import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carsAPI, bookingsAPI } from '../services/api';

const BookCar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: '',
        pickupLocation: '',
        dropoffLocation: '',
        notes: '',
    });

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const res = await carsAPI.getById(id);
                setCar(res.data);
                setBookingData((prev) => ({
                    ...prev,
                    pickupLocation: res.data.location || '',
                    dropoffLocation: res.data.location || '',
                }));
            } catch (err) {
                setError('Failed to load car details');
            } finally {
                setLoading(false);
            }
        };
        fetchCar();
    }, [id]);

    const handleChange = (e) => {
        setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    };

    const calculateDays = () => {
        if (!bookingData.startDate || !bookingData.endDate) return 0;
        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const calculateTotal = () => {
        return car ? (calculateDays() * car.pricePerDay).toFixed(2) : '0.00';
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError(null);
            await bookingsAPI.create({
                carId: parseInt(id),
                ...bookingData,
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create booking');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="container" style={{ paddingTop: '6rem', maxWidth: '600px', margin: '0 auto' }}>
                <div className="card text-center">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                    <h2>Booking Confirmed!</h2>
                    <p style={{ color: 'var(--color-gray-400)', marginBottom: '1.5rem' }}>
                        Your booking for {car?.year} {car?.make} {car?.model} has been submitted.
                        You will receive a confirmation once the owner approves your booking.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/my-bookings')} className="btn btn-primary">
                            View My Bookings
                        </button>
                        <button onClick={() => navigate('/cars')} className="btn btn-secondary">
                            Browse More Cars
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Book Your Car</h1>

            <div className="progress-steps" style={{ maxWidth: '500px', margin: '0 auto 2rem' }}>
                {['Select Dates', 'Add Details', 'Confirm'].map((label, i) => (
                    <div key={i} className={`progress-step ${step > i ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}>
                        <div className="progress-step-number">{i + 1}</div>
                        <div className="progress-step-label">{label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                <div className="card">
                    {error && <div className="alert alert-error">{error}</div>}

                    {step === 1 && (
                        <>
                            <h3 style={{ marginBottom: '1.5rem' }}>Select Your Dates</h3>
                            <div className="form-group">
                                <label className="form-label">Pick-up Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    className="form-input"
                                    value={bookingData.startDate}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Return Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    className="form-input"
                                    value={bookingData.endDate}
                                    onChange={handleChange}
                                    min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                className="btn btn-primary"
                                disabled={!bookingData.startDate || !bookingData.endDate || calculateDays() <= 0}
                            >
                                Continue
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h3 style={{ marginBottom: '1.5rem' }}>Add Details</h3>
                            <div className="form-group">
                                <label className="form-label">Pick-up Location</label>
                                <input
                                    type="text"
                                    name="pickupLocation"
                                    className="form-input"
                                    value={bookingData.pickupLocation}
                                    onChange={handleChange}
                                    placeholder="e.g., Kigali International Airport"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Drop-off Location</label>
                                <input
                                    type="text"
                                    name="dropoffLocation"
                                    className="form-input"
                                    value={bookingData.dropoffLocation}
                                    onChange={handleChange}
                                    placeholder="e.g., Kigali International Airport"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Special Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    className="form-input"
                                    rows={3}
                                    value={bookingData.notes}
                                    onChange={handleChange}
                                    placeholder="Any special requests..."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setStep(1)} className="btn btn-secondary">Back</button>
                                <button onClick={() => setStep(3)} className="btn btn-primary">Continue</button>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <h3 style={{ marginBottom: '1.5rem' }}>Confirm Booking</h3>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <p><strong>Dates:</strong> {bookingData.startDate} to {bookingData.endDate} ({calculateDays()} days)</p>
                                <p><strong>Pick-up:</strong> {bookingData.pickupLocation || 'Same as car location'}</p>
                                <p><strong>Drop-off:</strong> {bookingData.dropoffLocation || 'Same as car location'}</p>
                                {bookingData.notes && <p><strong>Notes:</strong> {bookingData.notes}</p>}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setStep(2)} className="btn btn-secondary">Back</button>
                                <button onClick={handleSubmit} className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Booking...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div className="card" style={{ height: 'fit-content' }}>
                    <img
                        src={car?.imageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'}
                        alt={`${car?.make} ${car?.model}`}
                        style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '1rem' }}
                    />
                    <h3>{car?.year} {car?.make} {car?.model}</h3>
                    <p style={{ color: 'var(--color-gray-400)', marginBottom: '1rem' }}>{car?.location}</p>

                    <div style={{ borderTop: '1px solid var(--color-gray-700)', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>${car?.pricePerDay}/day</span>
                            <span>x {calculateDays()} days</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '600' }}>
                            <span>Total</span>
                            <span className="text-accent">${calculateTotal()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookCar;
