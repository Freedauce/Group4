import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { bookingsAPI } from '../services/api';

const MyBookings = () => {
    const { user } = useSelector((state) => state.auth);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = user?.role === 'CarOwner'
                    ? await bookingsAPI.getOwnerBookings()
                    : await bookingsAPI.getMyBookings();
                setBookings(res.data);
            } catch (error) {
                console.error('Failed to fetch bookings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [user]);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await bookingsAPI.cancel(id);
            setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await bookingsAPI.updateStatus(id, status);
            setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            Pending: 'badge-warning',
            Confirmed: 'badge-info',
            InProgress: 'badge-info',
            Completed: 'badge-success',
            Cancelled: 'badge-error',
        };
        return styles[status] || 'badge-info';
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
            <h1 style={{ marginBottom: '2rem' }}>
                {user?.role === 'CarOwner' ? 'Bookings for My Cars' : 'My Bookings'}
            </h1>

            {bookings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3 className="empty-state-title">No bookings yet</h3>
                    <p>You haven't made any bookings yet.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Car</th>
                                {user?.role === 'CarOwner' && <th>Customer</th>}
                                <th>Dates</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <img
                                                src={booking.carImage || 'https://via.placeholder.com/60x40'}
                                                alt={booking.carName}
                                                style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                            <span>{booking.carName}</span>
                                        </div>
                                    </td>
                                    {user?.role === 'CarOwner' && (
                                        <td>
                                            <div>{booking.userName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>{booking.userEmail}</div>
                                        </td>
                                    )}
                                    <td>
                                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                    </td>
                                    <td>${booking.totalPrice.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(booking.status)}`}>{booking.status}</span>
                                    </td>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>
                                                ${booking.payment?.amount?.toFixed(2) || booking.totalPrice?.toFixed(2)}
                                            </div>
                                            <span className={`badge ${booking.payment?.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                                                {booking.payment?.status || 'Pending'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        {user?.role === 'CarOwner' && booking.status === 'Pending' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 2)}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(booking.id)}
                                                    className="btn btn-sm btn-ghost"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {user?.role === 'Client' && booking.status === 'Pending' && (
                                            <button onClick={() => handleCancel(booking.id)} className="btn btn-sm btn-ghost">
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
