import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, googleLogin, clearError } from '../store/slices/authSlice';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [googleCredential, setGoogleCredential] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        // Load Google Sign-In script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (window.google && GOOGLE_CLIENT_ID) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                });
                window.google.accounts.id.renderButton(
                    document.getElementById('google-signin-btn'),
                    {
                        theme: 'filled_black',
                        size: 'large',
                        width: 300,
                        text: 'signin_with'
                    }
                );
            }
        };

        return () => {
            const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, []);

    const handleGoogleResponse = async (response) => {
        if (response.credential) {
            setGoogleCredential(response.credential);
            setShowRoleModal(true);
        }
    };

    const handleRoleSelection = async (role) => {
        setShowRoleModal(false);
        if (googleCredential) {
            const result = await dispatch(googleLogin({
                credential: googleCredential,
                role: role
            }));
            if (googleLogin.fulfilled.match(result)) {
                navigate('/dashboard');
            }
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(login(formData));
        if (login.fulfilled.match(result)) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your KigaliDrive account</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.875rem' }}>Forgot password?</Link>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '1.5rem 0',
                    gap: '1rem'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-gray-600)' }}></div>
                    <span style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-gray-600)' }}></div>
                </div>

                {/* Google Sign-In Button */}
                <div id="google-signin-btn" style={{ display: 'flex', justifyContent: 'center' }}></div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-gray-400)' }}>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>

            {/* Role Selection Modal for Google Sign-In */}
            {showRoleModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                >
                    <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>Welcome to KigaliDrive!</h2>
                        <p style={{ color: 'var(--color-gray-400)', marginBottom: '2rem' }}>
                            How do you want to use the platform?
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                onClick={() => handleRoleSelection(4)}
                                className="btn btn-primary btn-lg"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    padding: '1.25rem'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>👤</span>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: '700' }}>I want to rent a car</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Browse and book vehicles</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleRoleSelection(3)}
                                className="btn btn-secondary btn-lg"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    padding: '1.25rem'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>🚗</span>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: '700' }}>I want to list my car</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Earn money by renting out</div>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowRoleModal(false)}
                            style={{
                                marginTop: '1.5rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-gray-500)',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
