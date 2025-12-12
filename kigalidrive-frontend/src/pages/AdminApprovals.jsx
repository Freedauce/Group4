import { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';

const AdminApprovals = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingCars, setPendingCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carsAPI, setCarsAPI] = useState(null);

    useEffect(() => {
        const loadCarsAPI = async () => {
            const { carsAPI: api } = await import('../services/api');
            setCarsAPI(api);
        };
        loadCarsAPI();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes] = await Promise.all([
                    usersAPI.getPendingApprovals(),
                ]);
                setPendingUsers(usersRes.data);

                if (carsAPI) {
                    try {
                        const carsRes = await carsAPI.getPending();
                        setPendingCars(carsRes.data);
                    } catch (e) {
                        console.log('No pending cars endpoint or not authorized');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch approvals', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [carsAPI]);

    const handleUserApproval = async (id, status) => {
        try {
            await usersAPI.approve(id, status);
            setPendingUsers(pendingUsers.filter(u => u.id !== id));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleCarApproval = async (id, status) => {
        try {
            await carsAPI.approve(id, status);
            setPendingCars(pendingCars.filter(c => c.id !== id));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update car');
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
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Pending Approvals</h1>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Car Owner Applications ({pendingUsers.length})</h2>
                {pendingUsers.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <p style={{ color: 'var(--color-gray-500)' }}>No pending user approvals</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Registered</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.firstName} {user.lastName}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phoneNumber || '-'}</td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleUserApproval(user.id, 2)}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUserApproval(user.id, 3)}
                                                    className="btn btn-sm btn-ghost"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section>
                <h2 style={{ marginBottom: '1rem' }}>Car Listings ({pendingCars.length})</h2>
                {pendingCars.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <p style={{ color: 'var(--color-gray-500)' }}>No pending car approvals</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '1.5rem' }}>
                        {pendingCars.map((car) => (
                            <div key={car.id} className="card">
                                <img
                                    src={car.imageUrl || 'https://via.placeholder.com/300x200'}
                                    alt={`${car.make} ${car.model}`}
                                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }}
                                />
                                <h3>{car.year} {car.make} {car.model}</h3>
                                <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
                                    Owner: {car.ownerName}<br />
                                    Price: ${car.pricePerDay}/day<br />
                                    Location: {car.location}
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <button
                                        onClick={() => handleCarApproval(car.id, 2)}
                                        className="btn btn-sm btn-primary"
                                        style={{ flex: 1 }}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleCarApproval(car.id, 5)}
                                        className="btn btn-sm btn-ghost"
                                        style={{ flex: 1 }}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminApprovals;
