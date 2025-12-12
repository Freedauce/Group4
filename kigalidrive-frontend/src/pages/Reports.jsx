import { useState, useEffect, useRef } from 'react';
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

const Reports = () => {
    const [activeTab, setActiveTab] = useState('revenue');
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [reportData, setReportData] = useState({
        revenue: [],
        bookings: [],
        cars: [],
        clients: []
    });
    const [monthlyData, setMonthlyData] = useState([]);
    const printRef = useRef();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    useEffect(() => {
        fetchReportData();
    }, [dateRange, activeTab]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'revenue' || activeTab === 'bookings') {
                const year = new Date().getFullYear();
                const monthlyResponse = await reportsAPI.getBookingsByMonth(year);
                if (monthlyResponse.data) {
                    setMonthlyData(monthlyResponse.data);
                }
            }

            if (activeTab === 'bookings') {
                const bookingsResponse = await bookingsAPI.getAll({ pageSize: 1000 });
                const bookings = bookingsResponse.data?.items || bookingsResponse.data || [];
                // Filter by date range
                const filtered = bookings.filter(b => {
                    const bookingDate = new Date(b.createdAt || b.startDate);
                    const start = new Date(dateRange.start);
                    const end = new Date(dateRange.end);
                    return bookingDate >= start && bookingDate <= end;
                });
                setReportData(prev => ({ ...prev, bookings: filtered }));
            }

            if (activeTab === 'cars') {
                const carsResponse = await carsAPI.getAll({ pageSize: 1000 });
                const cars = carsResponse.data?.items || carsResponse.data || [];
                setReportData(prev => ({ ...prev, cars }));
            }

            if (activeTab === 'clients') {
                const bookingsResponse = await bookingsAPI.getAll({ pageSize: 1000 });
                const bookings = bookingsResponse.data?.items || bookingsResponse.data || [];

                // Aggregate by client
                const clientStats = {};
                bookings.forEach(booking => {
                    const clientName = booking.userName || booking.userEmail || 'Unknown';
                    if (!clientStats[clientName]) {
                        clientStats[clientName] = {
                            name: clientName,
                            email: booking.userEmail || '',
                            phone: booking.userPhone || '',
                            totalBookings: 0,
                            completedBookings: 0,
                            totalSpent: 0
                        };
                    }
                    clientStats[clientName].totalBookings += 1;
                    if (booking.status === 'Completed' || booking.status === 4) {
                        clientStats[clientName].completedBookings += 1;
                    }
                    clientStats[clientName].totalSpent += booking.totalPrice || 0;
                });

                const clients = Object.values(clientStats).sort((a, b) => b.totalSpent - a.totalSpent);
                setReportData(prev => ({ ...prev, clients }));
            }

            if (activeTab === 'revenue') {
                // Get revenue data
                try {
                    const revenueResponse = await reportsAPI.getRevenue(dateRange.start, dateRange.end);
                    if (revenueResponse.data) {
                        setReportData(prev => ({ ...prev, revenue: revenueResponse.data }));
                    }
                } catch (e) {
                    console.log('Revenue data not available');
                }
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        }
        setLoading(false);
    };

    const setPresetRange = (preset) => {
        const today = new Date();
        let start, end;

        switch (preset) {
            case 'today':
                start = end = today.toISOString().split('T')[0];
                break;
            case 'week':
                start = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
                end = new Date().toISOString().split('T')[0];
                break;
            case 'month':
                start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
                end = new Date().toISOString().split('T')[0];
                break;
            case 'quarter':
                const quarter = Math.floor(new Date().getMonth() / 3);
                start = new Date(new Date().getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
                end = new Date().toISOString().split('T')[0];
                break;
            case 'year':
                start = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
                end = new Date().toISOString().split('T')[0];
                break;
            default:
                return;
        }
        setDateRange({ start, end });
    };

    const exportToCSV = () => {
        let csvContent = '';
        let filename = '';

        switch (activeTab) {
            case 'bookings':
                csvContent = 'ID,Client,Car,Start Date,End Date,Status,Total Price\n';
                reportData.bookings.forEach(b => {
                    csvContent += `${b.id},"${b.userName || 'N/A'}","${b.carMake || ''} ${b.carModel || ''}",${b.startDate},${b.endDate},${b.status},${b.totalPrice}\n`;
                });
                filename = 'bookings_report.csv';
                break;
            case 'cars':
                csvContent = 'ID,Make,Model,Year,Type,Status,Daily Rate,Owner\n';
                reportData.cars.forEach(c => {
                    csvContent += `${c.id},"${c.make}","${c.model}",${c.year},"${c.carType}",${c.status},${c.dailyRate},"${c.ownerName || 'N/A'}"\n`;
                });
                filename = 'cars_report.csv';
                break;
            case 'clients':
                csvContent = 'Name,Email,Phone,Total Bookings,Completed,Total Spent\n';
                reportData.clients.forEach(c => {
                    csvContent += `"${c.name}","${c.email}","${c.phone}",${c.totalBookings},${c.completedBookings},${c.totalSpent}\n`;
                });
                filename = 'clients_report.csv';
                break;
            case 'revenue':
                csvContent = 'Month,Bookings,Revenue\n';
                monthlyData.forEach(m => {
                    csvContent += `${m.month},${m.count},${m.revenue}\n`;
                });
                filename = 'revenue_report.csv';
                break;
            default:
                return;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    // Chart configurations
    const revenueChartData = {
        labels: months,
        datasets: [{
            label: 'Revenue ($)',
            data: months.map((m, i) => {
                const data = monthlyData.find(d => d.month === m);
                return data ? data.revenue : 0;
            }),
            fill: true,
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            borderColor: '#14B8A6',
            tension: 0.4,
        }],
    };

    const bookingsChartData = {
        labels: months,
        datasets: [{
            label: 'Bookings',
            data: months.map((m) => {
                const data = monthlyData.find(d => d.month === m);
                return data ? data.count : 0;
            }),
            backgroundColor: 'rgba(20, 184, 166, 0.8)',
            borderRadius: 8,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#6B6B6B' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#6B6B6B' } },
        },
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            1: { label: 'Pending', class: 'badge-warning' },
            2: { label: 'Confirmed', class: 'badge-info' },
            3: { label: 'In Progress', class: 'badge-primary' },
            4: { label: 'Completed', class: 'badge-success' },
            5: { label: 'Cancelled', class: 'badge-error' },
            'Pending': { label: 'Pending', class: 'badge-warning' },
            'Confirmed': { label: 'Confirmed', class: 'badge-info' },
            'InProgress': { label: 'In Progress', class: 'badge-primary' },
            'Completed': { label: 'Completed', class: 'badge-success' },
            'Cancelled': { label: 'Cancelled', class: 'badge-error' },
        };
        const s = statusMap[status] || { label: status, class: 'badge' };
        return <span className={`badge ${s.class}`}>{s.label}</span>;
    };

    const getCarStatusBadge = (status) => {
        const statusMap = {
            1: { label: 'Pending', class: 'badge-warning' },
            2: { label: 'Available', class: 'badge-success' },
            3: { label: 'Rented', class: 'badge-info' },
            4: { label: 'Maintenance', class: 'badge-error' },
            5: { label: 'Unavailable', class: 'badge' },
            'PendingApproval': { label: 'Pending', class: 'badge-warning' },
            'Available': { label: 'Available', class: 'badge-success' },
            'Rented': { label: 'Rented', class: 'badge-info' },
            'Maintenance': { label: 'Maintenance', class: 'badge-error' },
            'Unavailable': { label: 'Unavailable', class: 'badge' },
        };
        const s = statusMap[status] || { label: status, class: 'badge' };
        return <span className={`badge ${s.class}`}>{s.label}</span>;
    };

    // Calculate summary stats
    const getSummaryStats = () => {
        switch (activeTab) {
            case 'revenue':
                const totalRevenue = monthlyData.reduce((sum, m) => sum + (m.revenue || 0), 0);
                const totalBookingsCount = monthlyData.reduce((sum, m) => sum + (m.count || 0), 0);
                const avgPerBooking = totalBookingsCount > 0 ? totalRevenue / totalBookingsCount : 0;
                return [
                    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: '💰' },
                    { label: 'Total Bookings', value: totalBookingsCount, icon: '📅' },
                    { label: 'Avg per Booking', value: `$${avgPerBooking.toFixed(2)}`, icon: '📊' },
                ];
            case 'bookings':
                const completed = reportData.bookings.filter(b => b.status === 'Completed' || b.status === 4).length;
                const pending = reportData.bookings.filter(b => b.status === 'Pending' || b.status === 1).length;
                const bookingsTotal = reportData.bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
                return [
                    { label: 'Total Bookings', value: reportData.bookings.length, icon: '📅' },
                    { label: 'Completed', value: completed, icon: '✅' },
                    { label: 'Pending', value: pending, icon: '⏳' },
                    { label: 'Revenue', value: `$${bookingsTotal.toLocaleString()}`, icon: '💰' },
                ];
            case 'cars':
                const available = reportData.cars.filter(c => c.status === 'Available' || c.status === 2).length;
                const rented = reportData.cars.filter(c => c.status === 'Rented' || c.status === 3).length;
                return [
                    { label: 'Total Cars', value: reportData.cars.length, icon: '🚗' },
                    { label: 'Available', value: available, icon: '✅' },
                    { label: 'Rented', value: rented, icon: '🔑' },
                ];
            case 'clients':
                const totalClients = reportData.clients.length;
                const totalClientSpent = reportData.clients.reduce((sum, c) => sum + c.totalSpent, 0);
                const avgSpent = totalClients > 0 ? totalClientSpent / totalClients : 0;
                return [
                    { label: 'Total Clients', value: totalClients, icon: '👥' },
                    { label: 'Total Spent', value: `$${totalClientSpent.toLocaleString()}`, icon: '💰' },
                    { label: 'Avg per Client', value: `$${avgSpent.toFixed(2)}`, icon: '📊' },
                ];
            default:
                return [];
        }
    };

    return (
        <div className="page-container" ref={printRef}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem' }}>📊 Reports</h1>
                    <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)' }}>
                        Generate and export detailed reports
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" onClick={exportToCSV}>
                        📥 Export CSV
                    </button>
                    <button className="btn btn-secondary" onClick={handlePrint}>
                        🖨️ Print
                    </button>
                </div>
            </div>

            {/* Date Range Selector */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '500' }}>Date Range:</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['today', 'week', 'month', 'quarter', 'year'].map(preset => (
                            <button
                                key={preset}
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                onClick={() => setPresetRange(preset)}
                            >
                                {preset.charAt(0).toUpperCase() + preset.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                        <input
                            type="date"
                            className="form-input"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            style={{ width: 'auto' }}
                        />
                        <span>to</span>
                        <input
                            type="date"
                            className="form-input"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            style={{ width: 'auto' }}
                        />
                    </div>
                </div>
            </div>

            {/* Report Type Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { id: 'revenue', label: '💰 Revenue', icon: '💰' },
                    { id: 'bookings', label: '📅 Bookings', icon: '📅' },
                    { id: 'cars', label: '🚗 Cars', icon: '🚗' },
                    { id: 'clients', label: '👥 Clients', icon: '👥' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
                {getSummaryStats().map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading report data...</p>
                </div>
            ) : (
                <>
                    {/* Revenue Report */}
                    {activeTab === 'revenue' && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="card">
                                <h3 style={{ marginBottom: '1.5rem' }}>📈 Revenue Trend</h3>
                                <div style={{ height: '300px' }}>
                                    <Line data={revenueChartData} options={chartOptions} />
                                </div>
                            </div>
                            <div className="card">
                                <h3 style={{ marginBottom: '1.5rem' }}>📊 Monthly Bookings</h3>
                                <div style={{ height: '300px' }}>
                                    <Bar data={bookingsChartData} options={chartOptions} />
                                </div>
                            </div>
                            <div className="card" style={{ gridColumn: 'span 2' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Monthly Breakdown</h3>
                                <div className="table-container" style={{ background: 'transparent', border: 'none' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Month</th>
                                                <th>Bookings</th>
                                                <th>Revenue</th>
                                                <th>Avg per Booking</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthlyData.filter(m => m.count > 0).map((m, index) => (
                                                <tr key={index}>
                                                    <td style={{ fontWeight: '500' }}>{m.month}</td>
                                                    <td>{m.count}</td>
                                                    <td style={{ color: '#14B8A6', fontWeight: '600' }}>${m.revenue?.toLocaleString()}</td>
                                                    <td>${(m.count > 0 ? m.revenue / m.count : 0).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            {monthlyData.filter(m => m.count > 0).length === 0 && (
                                                <tr>
                                                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                        No data available for selected period
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bookings Report */}
                    {activeTab === 'bookings' && (
                        <div className="card">
                            <h3 style={{ marginBottom: '1rem' }}>Bookings List ({reportData.bookings.length} records)</h3>
                            <div className="table-container" style={{ background: 'transparent', border: 'none', maxHeight: '500px', overflowY: 'auto' }}>
                                <table className="table">
                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)' }}>
                                        <tr>
                                            <th>ID</th>
                                            <th>Client</th>
                                            <th>Car</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Status</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.bookings.map((booking) => (
                                            <tr key={booking.id}>
                                                <td>#{booking.id}</td>
                                                <td style={{ fontWeight: '500' }}>{booking.userName || 'N/A'}</td>
                                                <td>{booking.carMake} {booking.carModel}</td>
                                                <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                                                <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                                                <td>{getStatusBadge(booking.status)}</td>
                                                <td style={{ color: '#14B8A6', fontWeight: '600' }}>${booking.totalPrice?.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {reportData.bookings.length === 0 && (
                                            <tr>
                                                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                                    No bookings found for selected period
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Cars Report */}
                    {activeTab === 'cars' && (
                        <div className="card">
                            <h3 style={{ marginBottom: '1rem' }}>Cars Inventory ({reportData.cars.length} cars)</h3>
                            <div className="table-container" style={{ background: 'transparent', border: 'none', maxHeight: '500px', overflowY: 'auto' }}>
                                <table className="table">
                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)' }}>
                                        <tr>
                                            <th>ID</th>
                                            <th>Car</th>
                                            <th>Year</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Daily Rate</th>
                                            <th>Owner</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.cars.map((car) => (
                                            <tr key={car.id}>
                                                <td>#{car.id}</td>
                                                <td style={{ fontWeight: '500' }}>{car.make} {car.model}</td>
                                                <td>{car.year}</td>
                                                <td>{car.carType}</td>
                                                <td>{getCarStatusBadge(car.status)}</td>
                                                <td style={{ color: '#14B8A6', fontWeight: '600' }}>${car.dailyRate}/day</td>
                                                <td>{car.ownerName || 'N/A'}</td>
                                            </tr>
                                        ))}
                                        {reportData.cars.length === 0 && (
                                            <tr>
                                                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                                    No cars found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Clients Report */}
                    {activeTab === 'clients' && (
                        <div className="card">
                            <h3 style={{ marginBottom: '1rem' }}>Client Analytics ({reportData.clients.length} clients)</h3>
                            <div className="table-container" style={{ background: 'transparent', border: 'none', maxHeight: '500px', overflowY: 'auto' }}>
                                <table className="table">
                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)' }}>
                                        <tr>
                                            <th>#</th>
                                            <th>Client Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Total Bookings</th>
                                            <th>Completed</th>
                                            <th>Total Spent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.clients.map((client, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        width: '28px', height: '28px', borderRadius: '50%',
                                                        background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--bg-tertiary)',
                                                        color: index < 3 ? '#000' : 'var(--text-primary)', fontWeight: '600', fontSize: '0.875rem'
                                                    }}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: '500' }}>{client.name}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{client.email || '-'}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{client.phone || '-'}</td>
                                                <td>{client.totalBookings}</td>
                                                <td>
                                                    <span className="badge badge-success">{client.completedBookings}</span>
                                                </td>
                                                <td style={{ color: '#14B8A6', fontWeight: '600' }}>${client.totalSpent.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {reportData.clients.length === 0 && (
                                            <tr>
                                                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                                    No client data found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .page-container, .page-container * { visibility: visible; }
                    .page-container { position: absolute; left: 0; top: 0; width: 100%; }
                    .btn, button { display: none !important; }
                    .card { break-inside: avoid; margin-bottom: 1rem; }
                    .table { font-size: 12px; }
                }
            `}</style>
        </div>
    );
};

export default Reports;
