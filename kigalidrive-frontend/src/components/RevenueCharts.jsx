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
import { reportsAPI, bookingsAPI } from '../services/api';

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

const RevenueCharts = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        totalUsers: 0,
        totalCars: 0,
        pendingApprovals: 0,
        activeBookings: 0,
        completedBookings: 0,
        carOwners: 0
    });
    const [monthlyData, setMonthlyData] = useState([]);
    const [carsByType, setCarsByType] = useState([]);
    const [topClients, setTopClients] = useState([]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);

        // Fetch dashboard stats
        try {
            const statsResponse = await reportsAPI.getDashboard();
            console.log('Dashboard API response:', statsResponse.data);
            if (statsResponse.data) {
                const d = statsResponse.data;
                setDashboardStats({
                    totalRevenue: d.totalRevenue ?? d.TotalRevenue ?? 0,
                    totalBookings: d.totalBookings ?? d.TotalBookings ?? 0,
                    totalUsers: d.totalUsers ?? d.TotalUsers ?? 0,
                    totalCars: d.totalCars ?? d.TotalCars ?? 0,
                    pendingApprovals: d.pendingApprovals ?? d.PendingApprovals ?? 0,
                    activeBookings: d.activeBookings ?? d.ActiveBookings ?? 0,
                    completedBookings: d.completedBookings ?? d.CompletedBookings ?? 0,
                    carOwners: d.carOwners ?? d.CarOwners ?? 0
                });
            }
        } catch (e) {
            console.log('Dashboard stats error:', e);
        }

        // Fetch monthly bookings data
        try {
            const year = new Date().getFullYear();
            const monthlyResponse = await reportsAPI.getBookingsByMonth(year);
            if (monthlyResponse.data && Array.isArray(monthlyResponse.data)) {
                setMonthlyData(monthlyResponse.data);
            }
        } catch (e) {
            console.log('Monthly data not available:', e.message);
        }

        // Fetch cars by type
        try {
            const carsResponse = await reportsAPI.getCarsByType();
            if (carsResponse.data && Array.isArray(carsResponse.data)) {
                setCarsByType(carsResponse.data);
            }
        } catch (e) {
            console.log('Cars by type not available:', e.message);
        }

        // Fetch recent bookings to calculate top clients
        try {
            const bookingsResponse = await bookingsAPI.getAll({ pageSize: 100 });
            const bookings = bookingsResponse.data?.items || bookingsResponse.data || [];

            const clientStats = {};
            bookings.forEach(booking => {
                const clientName = booking.userName || booking.userEmail || 'Unknown';
                const clientPhone = booking.userPhone || '';

                if (!clientStats[clientName]) {
                    clientStats[clientName] = {
                        name: clientName,
                        phone: clientPhone,
                        email: booking.userEmail || '',
                        bookings: 0,
                        totalSpent: 0
                    };
                }
                clientStats[clientName].bookings += 1;
                clientStats[clientName].totalSpent += booking.totalPrice || 0;
            });

            const sortedClients = Object.values(clientStats)
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 5);

            setTopClients(sortedClients);
        } catch (e) {
            console.log('Bookings data not available:', e.message);
        }

        setLoading(false);
    };

    // Prepare chart data - match by month NAME (e.g. "Jan", "Dec")
    const getRevenueData = () => {
        const revenueByMonth = new Array(12).fill(0);
        const bookingsByMonth = new Array(12).fill(0);

        monthlyData.forEach(item => {
            // Backend returns { month: "Jan", count: X, revenue: Y }
            const monthIndex = months.indexOf(item.month);
            if (monthIndex >= 0) {
                revenueByMonth[monthIndex] = item.revenue || 0;
                bookingsByMonth[monthIndex] = item.count || 0;
            }
        });

        return { revenueByMonth, bookingsByMonth };
    };

    const { revenueByMonth, bookingsByMonth } = getRevenueData();

    const revenueChartData = {
        labels: months,
        datasets: [{
            label: 'Revenue ($)',
            data: revenueByMonth,
            fill: true,
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            borderColor: '#14B8A6',
            tension: 0.4,
            pointBackgroundColor: '#14B8A6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
        }],
    };

    const bookingsChartData = {
        labels: months,
        datasets: [{
            label: 'Bookings',
            data: bookingsByMonth,
            backgroundColor: 'rgba(20, 184, 166, 0.8)',
            borderRadius: 8,
        }],
    };

    const carsTypeData = {
        labels: carsByType.length > 0 ? carsByType.map(c => c.carType || 'Other') : ['No Data'],
        datasets: [{
            data: carsByType.length > 0 ? carsByType.map(c => c.count) : [1],
            backgroundColor: ['#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A', '#0891B2'],
            borderWidth: 0,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: 12 },
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#6B6B6B' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#6B6B6B' } },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { color: '#A1A1A1', usePointStyle: true, padding: 15 } },
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
                    <div className="stat-value">${(dashboardStats.totalRevenue || 0).toLocaleString()}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{(dashboardStats.totalBookings || 0).toLocaleString()}</div>
                    <div className="stat-label">Total Bookings</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{(dashboardStats.totalUsers || 0).toLocaleString()}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{dashboardStats.totalCars || 0}</div>
                    <div className="stat-label">Listed Cars</div>
                </div>
            </div>

            {/* Second Stats Row */}
            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#F59E0B' }}>{dashboardStats.pendingApprovals || 0}</div>
                    <div className="stat-label">Pending Approvals</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: '#10B981' }}>{dashboardStats.activeBookings || 0}</div>
                    <div className="stat-label">Active Bookings</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{dashboardStats.completedBookings || 0}</div>
                    <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{dashboardStats.carOwners || 0}</div>
                    <div className="stat-label">Car Owners</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>📈 Revenue Over Time</h3>
                        <span className="badge badge-info">{new Date().getFullYear()}</span>
                    </div>
                    <div style={{ height: '300px' }}>
                        <Line data={revenueChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>📊 Monthly Bookings</h3>
                        <span className="badge badge-success">{bookingsByMonth.reduce((a, b) => a + b, 0)} total</span>
                    </div>
                    <div style={{ height: '300px' }}>
                        <Bar data={bookingsChartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>🚗 Cars by Type</h3>
                    <div style={{ height: '280px' }}>
                        <Doughnut data={carsTypeData} options={doughnutOptions} />
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>🏆 Top Clients</h3>
                    {topClients.length > 0 ? (
                        <div className="table-container" style={{ background: 'transparent', border: 'none' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Client</th>
                                        <th>Phone</th>
                                        <th>Bookings</th>
                                        <th>Spent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topClients.map((client, index) => (
                                        <tr key={index}>
                                            <td>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    width: '28px', height: '28px', borderRadius: '50%',
                                                    background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#1E1E1E',
                                                    color: index < 3 ? '#000' : '#fff', fontWeight: '600', fontSize: '0.875rem'
                                                }}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: '500' }}>{client.name}</td>
                                            <td style={{ color: '#A1A1A1', fontSize: '0.875rem' }}>{client.phone || '-'}</td>
                                            <td>{client.bookings}</td>
                                            <td style={{ color: '#14B8A6', fontWeight: '600' }}>${client.totalSpent.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6B6B6B' }}>
                            <p>No client data yet. Bookings will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RevenueCharts;
