import { useEffect, useState } from 'react';
import { paymentsAPI } from '../services/api';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await paymentsAPI.getMyPayments();
            setPayments(res.data);
        } catch (error) {
            console.error('Failed to fetch payments', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await paymentsAPI.updateStatus(id, { status: 2, paymentMethod: 'Cash' });
            fetchPayments();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to approve payment');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this payment? The booking will be cancelled.')) return;
        try {
            await paymentsAPI.updateStatus(id, { status: 3 });
            fetchPayments();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update payment');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            Pending: 'badge-warning',
            Paid: 'badge-success',
            Failed: 'badge-error',
        };
        return styles[status] || 'badge-info';
    };

    const filteredPayments = payments.filter(p => {
        if (filter === 'all') return true;
        if (filter === 'pending') return p.status === 'Pending' || p.paymentStatus === 1;
        if (filter === 'paid') return p.status === 'Paid' || p.paymentStatus === 2;
        return true;
    });

    const pendingPayments = payments.filter(p => p.status === 'Pending' || p.paymentStatus === 1);
    const paidPayments = payments.filter(p => p.status === 'Paid' || p.paymentStatus === 2);

    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOwnerPayout = paidPayments.reduce((sum, p) => sum + (p.ownerPayout || p.amount * 0.95), 0);
    const totalPlatformFee = paidPayments.reduce((sum, p) => sum + (p.platformFee || p.amount * 0.05), 0);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Payment Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>${totalPending.toFixed(2)}</div>
                    <div className="stat-label">Pending Payments</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">${totalPaid.toFixed(2)}</div>
                    <div className="stat-label">Total Collected</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>${totalOwnerPayout.toFixed(2)}</div>
                    <div className="stat-label">Your Earnings (95%)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-accent)' }}>${totalPlatformFee.toFixed(2)}</div>
                    <div className="stat-label">Platform Fee (5%)</div>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setFilter('all')} className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}>
                    All ({payments.length})
                </button>
                <button onClick={() => setFilter('pending')} className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}>
                    Pending ({pendingPayments.length})
                </button>
                <button onClick={() => setFilter('paid')} className={`btn btn-sm ${filter === 'paid' ? 'btn-primary' : 'btn-secondary'}`}>
                    Paid ({paidPayments.length})
                </button>
            </div>

            {filteredPayments.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">💰</div>
                    <h3 className="empty-state-title">No payments found</h3>
                    <p>When clients book your cars, payments will appear here.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Car</th>
                                <th>Customer</th>
                                <th>Dates</th>
                                <th>Amount</th>
                                <th>Your Earnings</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id}>
                                    <td>#{payment.id}</td>
                                    <td>{payment.carName || `Booking #${payment.bookingId}`}</td>
                                    <td>
                                        <div>{payment.customerName || 'Customer'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                                            {payment.customerPhone || 'No phone'}
                                        </div>
                                    </td>
                                    <td>
                                        {payment.startDate ? new Date(payment.startDate).toLocaleDateString() : 'N/A'} -
                                        {payment.endDate ? new Date(payment.endDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>${payment.amount.toFixed(2)}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                                            Fee: ${(payment.platformFee || payment.amount * 0.05).toFixed(2)}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: '600', color: 'var(--color-success)' }}>
                                        ${(payment.ownerPayout || payment.amount * 0.95).toFixed(2)}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(payment.status)}`}>{payment.status}</span>
                                    </td>
                                    <td>
                                        {(payment.status === 'Pending' || payment.paymentStatus === 1) && (
                                            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                                <button onClick={() => handleApprove(payment.id)} className="btn btn-sm btn-primary">
                                                    Confirm
                                                </button>
                                                <button onClick={() => handleReject(payment.id)} className="btn btn-sm btn-ghost">
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {payment.status === 'Paid' && (
                                            <span style={{ color: 'var(--color-success)' }}>Confirmed</span>
                                        )}
                                        {payment.status === 'Failed' && (
                                            <span style={{ color: 'var(--color-error)' }}>Rejected</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="card" style={{ marginTop: '2rem', background: 'var(--color-primary)' }}>
                <h3 style={{ marginBottom: '1rem' }}>How Payments Work</h3>
                <ol style={{ color: 'var(--color-gray-400)', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                    <li>Client books your car - Payment created as Pending</li>
                    <li>You confirm payment received - Status changes to Paid</li>
                    <li>Platform takes 5% commission, you receive 95%</li>
                    <li>Client gets notified with your contact info</li>
                    <li>You receive notification with client details and payout amount</li>
                </ol>
            </div>
        </div>
    );
};

export default Payments;
