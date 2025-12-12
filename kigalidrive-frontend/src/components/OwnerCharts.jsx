import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { reportsAPI, bookingsAPI, carsAPI } from '../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const OwnerCharts = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [myCars, setMyCars] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [earningsByMonth, setEarningsByMonth] = useState(new Array(12).fill(0));
    const [bookingsByMonth, setBookingsByMonth] = useState(new Array(12).fill(0));

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    useEffect(() => {
        fetchOwnerData();
    }, []);

    const fetchOwnerData = async () => {
        try {
            setLoading(true);

            // Fetch owner stats
            const statsResponse = await reportsAPI.getOwnerStats();
            setStats(statsResponse.data);

            // Fetch my cars
            const carsResponse = await carsAPI.getMyCars();
            setMyCars(carsResponse.data || []);

            // Fetch owner bookings
            const bookingsResponse = await bookingsAPI.getOwnerBookings();
            const bookings = bookingsResponse.data || [];
            setRecentBookings(bookings.slice(0, 5));

            // Calculate earnings by month
            const monthlyEarnings = new Array(12).fill(0);
            const monthlyBookings = new Array(12).fill(0);

            bookings.forEach(booking => {
                const bookingDate = new Date(booking.startDate || booking.createdAt);
                const month = bookingDate.getMonth();
                if (booking.status === 'Completed' || booking.status === 'Confirmed') {
                    monthlyEarnings[month] += booking.totalPrice || 0;
                }
                monthlyBookings[month] += 1;
            });

            setEarningsByMonth(monthlyEarnings);
            setBookingsByMonth(monthlyBookings);

        } catch (error) {
            console.error('Error fetching owner data:', error);
        } finally {
            setLoading(false);
        }
    };

    const earningsChartData = {
        labels: months,
        datasets: [
            {
                label: 'Earnings ($)',
                data: earningsByMonth,
                fill: true,
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                borderColor: '#14B8A6',
                tension: 0.4,
                pointBackgroundColor: '#14B8A6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const bookingsChartData = {
        labels: months,
        datasets: [
            {
                label: 'Bookings',
                data: bookingsByMonth,
                backgroundColor: 'rgba(20, 184, 166, 0.8)',
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const carStatusData = {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [
            {
                data: [
                    myCars.filter(c => c.approvalStatus === 'Approved').length,
                    myCars.filter(c => c.approvalStatus === 'Pending').length,
                    myCars.filter(c => c.approvalStatus === 'Rejected').length,
                ],
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'var(--text-muted)' },
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'var(--text-muted)' },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: 'var(--text-secondary)',
                    usePointStyle: true,
                    padding: 15,
                },
            },
        },
        cutout: '65%',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ padding: '4rem' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-value">${stats?.totalEarnings?.toLocaleString() || '0'}</div>
                    <div className="stat-label">Total Earnings</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats?.totalCars || myCars.length || '0'}</div>
                    <div className="stat-label">My Cars</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{stats?.approvedCars || '0'}</div>
                    <div className="stat-label">Approved Cars</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats?.activeBookings || '0'}</div>
                    <div className="stat-label">Active Bookings</div>
                </div>
            </div>

            {/* Pending Payments Alert */}
            {stats?.pendingPayments > 0 && (
                <div className="alert alert-warning" style={{ marginBottom: '2rem' }}>
                    💰 You have <strong>${stats.pendingPayments.toFixed(2)}</strong> in pending payments awaiting confirmation.
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
                {/* Earnings Chart */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>💰 My Earnings</h3>
                        <span className="badge badge-success">
                            ${earningsByMonth.reduce((a, b) => a + b, 0).toLocaleString()} total
                        </span>
                    </div>
                    <div style={{ height: '280px' }}>
                        <Line data={earningsChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Bookings Chart */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>📊 My Bookings</h3>
                        <span className="badge badge-info">
                            {bookingsByMonth.reduce((a, b) => a + b, 0)} total
                        </span>
                    </div>
                    <div style={{ height: '280px' }}>
                        <Bar data={bookingsChartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">
                {/* Car Status */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>🚗 Car Status Overview</h3>
                    <div style={{ height: '250px' }}>
                        <Doughnut data={carStatusData} options={doughnutOptions} />
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>📋 Recent Bookings</h3>
                    {recentBookings.length > 0 ? (
                        <div className="table-container" style={{ background: 'transparent', border: 'none' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Client</th>
                                        <th>Car</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBookings.map((booking, index) => (
                                        <tr key={index}>
                                            <td style={{ fontWeight: '500' }}>{booking.clientName || 'Client'}</td>
                                            <td>{booking.carName || `${booking.carMake} ${booking.carModel}` || 'Car'}</td>
                                            <td>
                                                <span className={`badge badge-${booking.status === 'Completed' ? 'success' :
                                                        booking.status === 'Confirmed' ? 'info' :
                                                            booking.status === 'Pending' ? 'warning' : 'error'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--accent)', fontWeight: '600' }}>
                                                ${booking.totalPrice?.toFixed(2) || '0'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '2rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No bookings yet. Your bookings will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerCharts;
