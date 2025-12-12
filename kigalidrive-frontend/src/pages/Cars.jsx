import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carsAPI } from '../services/api';
import CarCard from '../components/CarCard';
import { useSelector } from 'react-redux';

const Cars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        carType: '',
        minPrice: '',
        maxPrice: '',
        transmission: '',
        location: '',
    });
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const carTypes = ['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'Van'];
    const transmissions = ['Automatic', 'Manual'];

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.carType) params.carType = filters.carType;
            if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
            if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
            if (filters.transmission) params.transmission = filters.transmission;
            if (filters.location) params.location = filters.location;

            const res = await carsAPI.getAvailable(params);
            setCars(res.data.items || res.data);
        } catch (error) {
            console.error('Failed to fetch cars', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCars();
    };

    const handleBook = (car) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        navigate(`/cars/${car.id}/book`);
    };

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Browse Available Cars</h1>

            <form onSubmit={handleSearch} className="search-box" style={{ marginBottom: '2rem' }}>
                <div className="search-box-grid">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Location</label>
                        <input
                            type="text"
                            name="location"
                            className="form-input"
                            placeholder="e.g., Kigali"
                            value={filters.location}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Car Type</label>
                        <select name="carType" className="form-select" value={filters.carType} onChange={handleFilterChange}>
                            <option value="">All Types</option>
                            {carTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Transmission</label>
                        <select name="transmission" className="form-select" value={filters.transmission} onChange={handleFilterChange}>
                            <option value="">Any</option>
                            {transmissions.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Min Price ($/day)</label>
                        <input
                            type="number"
                            name="minPrice"
                            className="form-input"
                            placeholder="0"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Max Price ($/day)</label>
                        <input
                            type="number"
                            name="maxPrice"
                            className="form-input"
                            placeholder="500"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Search
                        </button>
                    </div>
                </div>
            </form>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <div className="spinner"></div>
                </div>
            ) : cars.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🚗</div>
                    <h3 className="empty-state-title">No cars found</h3>
                    <p>Try adjusting your search filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '1.5rem' }}>
                    {cars.map((car) => (
                        <CarCard key={car.id} car={car} onBook={handleBook} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Cars;
