import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useEffect } from 'react';
import { fetchUnreadCount } from '../store/slices/notificationsSlice';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { unreadCount } = useSelector((state) => state.notifications);
    const { theme, toggleTheme } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show navbar on home page (it has its own)
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchUnreadCount());
        }
    }, [isAuthenticated, dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    if (isHomePage) return null;

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="navbar-brand">
                    Kigali<span>Drive</span>
                </Link>

                <div className="navbar-links">
                    {!isAuthenticated ? (
                        <>
                            <Link to="/cars" className="navbar-link">Browse Cars</Link>
                            <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>
                            <Link to="/login" className="navbar-link">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
                            <Link to="/cars" className="navbar-link">Cars</Link>
                            {user?.role === 'Client' && (
                                <Link to="/my-bookings" className="navbar-link">My Bookings</Link>
                            )}
                            <Link to="/notifications" className="navbar-link notification-bell">
                                🔔
                                {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
                            </Link>
                            <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>
                            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
