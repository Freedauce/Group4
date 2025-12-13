import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { forgotPassword, clearError } from '../store/slices/authSlice';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(forgotPassword(email));
        if (forgotPassword.fulfilled.match(result)) {
            setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <div className="auth-container">
                <div className="auth-card text-center">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
                    <h2 className="auth-title">Check Your Email</h2>
                    <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
                        If an account with that email exists, we've sent you a password reset link.
                        Please check your inbox and spam folder.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        The link will expire in 24 hours.
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Forgot Password</h1>
                <p className="auth-subtitle">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) dispatch(clearError());
                            }}
                            className="form-input"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Remember your password? <Link to="/login">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
