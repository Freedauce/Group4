import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { reportsAPI, carsAPI } from '../services/api';
import CarCard from '../components/CarCard';
import RevenueCharts from '../components/RevenueCharts';
import OwnerCharts from '../components/OwnerCharts';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const role = user?.role;
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [recommendedCars, setRecommendedCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (role === 'Admin' || role === 'Manager') {
                    const res = await reportsAPI.getDashboard();
                    setStats(res.data);
                } else if (role === 'CarOwner') {
                    const res = await reportsAPI.getOwnerStats();
                    setStats(res.data);
                } else if (role === 'Client') {
                    const [statsRes, carsRes] = await Promise.all([
                        reportsAPI.getClientStats(),
                        carsAPI.getRecommended(4),
                    ]);
                    console.log('Client Stats Response:', statsRes.data);
                    setStats(statsRes.data);
                    setRecommendedCars(carsRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [role]);

    const handleBookCar = (car) => {
        navigate(`/cars/${car.id}/book`);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    // Admin/Manager Dashboard with Charts
    if (role === 'Admin' || role === 'Manager') {
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Here's your platform overview.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/admin/approvals" className="btn btn-secondary">✅ Approvals</Link>
                        <Link to="/admin/reports" className="btn btn-primary">📊 Full Reports</Link>
                    </div>
                </div>

                <RevenueCharts />
            </div>
        );
    }

    // Car Owner Dashboard
    if (role === 'CarOwner') {
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Car Owner Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Track your vehicles and earnings</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/my-cars/new" className="btn btn-primary">+ List New Car</Link>
                        <Link to="/my-cars" className="btn btn-secondary">Manage Cars</Link>
                    </div>
                </div>

                <OwnerCharts />
            </div>
        );
    }

    // Client Dashboard
    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1>Welcome back, {user?.firstName || 'there'}!</h1>
                <p style={{ color: 'var(--color-gray-400)' }}>Find your perfect ride for any adventure.</p>
            </div>

            <div className="search-box" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Find Your Car</h3>
                <div className="search-box-grid">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Location</label>
                        <input type="text" className="form-input" placeholder="Kigali, Rwanda" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Pick-up Date</label>
                        <input type="date" className="form-input" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Return Date</label>
                        <input type="date" className="form-input" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Link to="/cars" className="btn btn-primary" style={{ width: '100%' }}>Search Cars</Link>
                    </div>
                </div>
            </div>

            {recommendedCars.length > 0 && (
                <>
                    <h2 style={{ marginBottom: '1rem' }}>Recommended for You</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '1.5rem' }}>
                        {recommendedCars.map((car) => (
                            <CarCard key={car.id} car={car} onBook={handleBookCar} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
