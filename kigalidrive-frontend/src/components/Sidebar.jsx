import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import { logout } from '../store/slices/authSlice';

const Sidebar = () => {
    const { user } = useSelector((state) => state.auth);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const role = user?.role;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const getLinks = () => {
        const baseLinks = [
            { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['Admin', 'Manager', 'CarOwner', 'Client'] },
        ];

        const roleLinks = {
            Admin: [
                { path: '/admin/users', label: 'Manage Users', icon: '👥' },
                { path: '/admin/approvals', label: 'Approvals', icon: '✅' },
                { path: '/admin/cars', label: 'All Cars', icon: '🚗' },
                { path: '/admin/bookings', label: 'All Bookings', icon: '📋' },
                { path: '/admin/reports', label: 'Reports', icon: '📈' },
            ],
            Manager: [
                { path: '/admin/approvals', label: 'Approvals', icon: '✅' },
                { path: '/admin/cars', label: 'All Cars', icon: '🚗' },
                { path: '/admin/bookings', label: 'All Bookings', icon: '📋' },
                { path: '/admin/reports', label: 'Reports', icon: '📈' },
            ],
            CarOwner: [
                { path: '/my-cars', label: 'My Cars', icon: '🚗' },
                { path: '/owner-bookings', label: 'Bookings', icon: '📋' },
                { path: '/payments', label: 'Payments', icon: '💰' },
            ],
            Client: [
                { path: '/cars', label: 'Browse Cars', icon: '🔍' },
                { path: '/my-bookings', label: 'My Bookings', icon: '📋' },
            ],
        };

        return [...baseLinks, ...(roleLinks[role] || [])];
    };

    return (
        <aside className="sidebar">
            {/* User Info */}
            <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Logged in as
                </div>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    {user?.name || `${user?.firstName} ${user?.lastName}`}
                </div>
                <span className="badge badge-info">{role}</span>
            </div>

            {/* Navigation */}
            <div className="sidebar-section">
                <div className="sidebar-section-title">Navigation</div>
                <nav>
                    {getLinks().map((link) => (
                        (!link.roles || link.roles.includes(role)) && (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
                            >
                                <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                                {link.label}
                            </Link>
                        )
                    ))}
                </nav>
            </div>

            {/* Quick Actions */}
            <div className="sidebar-section" style={{ marginTop: 'auto' }}>
                <div className="sidebar-section-title">Settings</div>

                {/* Theme Toggle */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--spacing-3) var(--spacing-4)',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: 'var(--spacing-2)'
                    }}
                >
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                    </span>
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        style={{
                            width: '36px',
                            height: '36px',
                            fontSize: '1rem'
                        }}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>

                <Link to="/" className="sidebar-link">
                    <span style={{ fontSize: '1.1rem' }}>🏠</span>
                    Home
                </Link>

                {/* Logout Button - Always Visible */}
                <button
                    onClick={handleLogout}
                    className="sidebar-link"
                    style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: 'var(--color-error)',
                        marginTop: 'var(--spacing-2)'
                    }}
                >
                    <span style={{ fontSize: '1.1rem' }}>🚪</span>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
