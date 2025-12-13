import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword, clearError } from '../store/slices/authSlice';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [success, setSuccess] = useState(false);
    const [validationError, setValidationError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!token) {
            setValidationError('Invalid or missing reset token. Please request a new password reset.');
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setValidationError('');
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword.length < 6) {
            setValidationError('Password must be at least 6 characters long.');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setValidationError('Passwords do not match.');
            return;
        }

        const result = await dispatch(resetPassword({
            token,
            newPassword: formData.newPassword
        }));

        if (resetPassword.fulfilled.match(result)) {
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-card text-center">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
                    <h2 className="auth-title">Invalid Link</h2>
                    <p className="auth-subtitle">
                        This password reset link is invalid or has expired.
                    </p>
                    <Link to="/forgot-password" className="btn btn-primary" style={{ width: '100%' }}>
                        Request New Reset Link
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card text-center">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                    <h2 className="auth-title">Password Reset!</h2>
                    <p className="auth-subtitle">
                        Your password has been successfully reset.
                        Redirecting you to login...
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Reset Password</h1>
                <p className="auth-subtitle">
                    Enter your new password below.
                </p>

                {(error || validationError) && (
                    <div className="alert alert-error">{error || validationError}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Remember your password? <Link to="/login">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
