import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { carsAPI, authAPI } from '../services/api';

const AddCar = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        color: '',
        seats: 5,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        pricePerDay: '',
        description: '',
        features: '',
        imageUrl: '',
        location: 'Kigali',
    });

    useEffect(() => {
        // Check if user has phone number
        if (user && !user.phoneNumber) {
            setShowPhoneModal(true);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file (PNG, JPG, etc.)');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData({ ...formData, imageUrl: reader.result });
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handlePhoneSubmit = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        try {
            await authAPI.updateProfile({ phoneNumber });
            // Update local storage user data
            const updatedUser = { ...user, phoneNumber };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setShowPhoneModal(false);
            setError('');
        } catch (err) {
            setError('Failed to save phone number. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const carData = {
                ...formData,
                year: parseInt(formData.year),
                seats: parseInt(formData.seats),
                pricePerDay: parseFloat(formData.pricePerDay),
                features: formData.features.split(',').map(f => f.trim()).filter(f => f),
            };

            await carsAPI.create(carData);
            navigate('/my-cars');
        } catch (err) {
            // Check if phone number is required
            if (err.response?.data?.requiresPhone) {
                setShowPhoneModal(true);
            }
            setError(err.response?.data?.message || 'Failed to add car. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '2rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>List Your Car</h1>
            <p style={{ color: 'var(--color-gray-400)', marginBottom: '2rem' }}>
                Fill in the details below to list your car for rent.
            </p>

            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* Image Upload Section */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>📷 Car Photo</h3>

                    <div
                        style={{
                            border: '2px dashed var(--color-gray-600)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            background: imagePreview ? 'transparent' : 'var(--color-primary)',
                        }}
                        onClick={() => document.getElementById('car-image-input').click()}
                    >
                        {imagePreview ? (
                            <div>
                                <img
                                    src={imagePreview}
                                    alt="Car preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '250px',
                                        borderRadius: '0.5rem',
                                        objectFit: 'cover'
                                    }}
                                />
                                <p style={{ marginTop: '1rem', color: 'var(--color-gray-400)', fontSize: '0.875rem' }}>
                                    Click to change image
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
                                <p style={{ color: 'var(--color-gray-300)', marginBottom: '0.5rem' }}>
                                    Click to upload a photo of your car
                                </p>
                                <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
                                    PNG, JPG, JPEG up to 5MB
                                </p>
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        id="car-image-input"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                    />
                </div>

                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>🚗 Vehicle Information</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Make *</label>
                            <input
                                type="text"
                                name="make"
                                value={formData.make}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., Toyota"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Model *</label>
                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., Land Cruiser"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Year *</label>
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                className="form-input"
                                min="2000"
                                max={new Date().getFullYear() + 1}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">License Plate *</label>
                            <input
                                type="text"
                                name="licensePlate"
                                value={formData.licensePlate}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., RAA 123B"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Color</label>
                            <input
                                type="text"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., White"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Seats</label>
                            <select
                                name="seats"
                                value={formData.seats}
                                onChange={handleChange}
                                className="form-input"
                            >
                                {[2, 4, 5, 7, 8, 12, 15].map(n => (
                                    <option key={n} value={n}>{n} seats</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Transmission</label>
                            <select
                                name="transmission"
                                value={formData.transmission}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="Automatic">Automatic</option>
                                <option value="Manual">Manual</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fuel Type</label>
                            <select
                                name="fuelType"
                                value={formData.fuelType}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="Electric">Electric</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>💰 Pricing & Location</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Price Per Day (USD) *</label>
                            <input
                                type="number"
                                name="pricePerDay"
                                value={formData.pricePerDay}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., 50"
                                min="1"
                                step="0.01"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., Kigali, Kimironko"
                            />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>📝 Details</h3>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-input"
                            rows="3"
                            placeholder="Describe your car, its condition, and any special features..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Features (comma separated)</label>
                        <input
                            type="text"
                            name="features"
                            value={formData.features}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="e.g., Air Conditioning, GPS, Bluetooth, Sunroof"
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/my-cars')}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : '🚗 List My Car'}
                    </button>
                </div>

                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-gray-500)', textAlign: 'center' }}>
                    Clients will be able to contact you at your registered phone number.
                </p>
            </form>

            {/* Phone Number Modal */}
            {showPhoneModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                >
                    <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Add Your Phone Number</h2>
                        <p style={{ color: 'var(--color-gray-400)', marginBottom: '1.5rem' }}>
                            Clients need to contact you about bookings. Please add your phone number.
                        </p>

                        {error && <div className="alert alert-error" style={{ marginBottom: '1rem', textAlign: 'left' }}>{error}</div>}

                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <label className="form-label">Phone Number *</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="form-input"
                                placeholder="e.g., +250 788 123 456"
                                style={{ fontSize: '1.1rem' }}
                            />
                        </div>

                        <button
                            onClick={handlePhoneSubmit}
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            Save & Continue
                        </button>

                        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                            Your number will only be shared with clients who book your car.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddCar;
