import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register, verifyCode, resendCode, clearError } from '../store/slices/authSlice';

const Register = () => {
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        role: 4, // Client by default (3 = CarOwner, 4 = Client)
    });
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [codeError, setCodeError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [success, setSuccess] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    // Check if user is registering as owner from URL param
    useEffect(() => {
        if (searchParams.get('role') === 'owner') {
            setFormData(prev => ({ ...prev, role: 3 }));
        }
    }, [searchParams]);

    const handleChange = (e) => {
        const value = e.target.type === 'radio' ? parseInt(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
        if (error) dispatch(clearError());
    };

    const nextStep = () => {
        if (step === 1 && (!formData.firstName || !formData.lastName)) {
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return;
        }

        const result = await dispatch(register(formData));
        if (register.fulfilled.match(result)) {
            // Show verification code modal
            setShowCodeModal(true);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setCodeError('');
        const result = await dispatch(verifyCode({
            email: formData.email,
            code: verificationCode
        }));
        if (verifyCode.fulfilled.match(result)) {
            setShowCodeModal(false);
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } else {
            setCodeError(result.payload || 'Invalid verification code');
        }
    };

    const handleResendCode = async () => {
        setResendLoading(true);
        setResendSuccess(false);
        await dispatch(resendCode(formData.email));
        setResendLoading(false);
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card text-center">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                    <h2 className="auth-title">Account Verified!</h2>
                    <p className="auth-subtitle">
                        Welcome to KigaliDrive! Redirecting to your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join KigaliDrive today</p>

                <div className="progress-steps">
                    <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                        <div className="progress-step-number">{step > 1 ? '' : '1'}</div>
                        <div className="progress-step-label">Personal</div>
                    </div>
                    <div className={`progress-step-line ${step > 1 ? 'active' : ''}`} style={{ background: step > 1 ? 'var(--accent)' : 'var(--border-color)' }}></div>
                    <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                        <div className="progress-step-number">{step > 2 ? '' : '2'}</div>
                        <div className="progress-step-label">Account</div>
                    </div>
                    <div className={`progress-step-line ${step > 2 ? 'active' : ''}`} style={{ background: step > 2 ? 'var(--accent)' : 'var(--border-color)' }}></div>
                    <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                        <div className="progress-step-number">3</div>
                        <div className="progress-step-label">Complete</div>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <>
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="John"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Doe"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="+250 788 000 000"
                                />
                            </div>

                            <button type="button" onClick={nextStep} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                Continue
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
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
                                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <div className="form-error">Passwords do not match</div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={prevStep} className="btn btn-secondary" style={{ flex: 1 }}>
                                    Back
                                </button>
                                <button type="button" onClick={nextStep} className="btn btn-primary" style={{ flex: 1 }}>
                                    Continue
                                </button>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Account Type</label>
                                <div className="role-cards">
                                    <div
                                        className={`role-card ${formData.role === 4 ? 'selected' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: 4 })}
                                    >
                                        <div className="role-card-icon">🚗</div>
                                        <div className="role-card-title">Client</div>
                                        <div className="role-card-desc">I want to rent cars</div>
                                    </div>
                                    <div
                                        className={`role-card ${formData.role === 3 ? 'selected' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: 3 })}
                                    >
                                        <div className="role-card-icon">🔑</div>
                                        <div className="role-card-title">Car Owner</div>
                                        <div className="role-card-desc">I want to rent out my cars</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={prevStep} className="btn btn-secondary" style={{ flex: 1 }}>
                                    Back
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </>
                    )}
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-gray-400)' }}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>

            {/* Verification Code Modal */}
            {showCodeModal && (
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
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Verify Your Email</h2>
                        <p style={{ color: 'var(--color-gray-400)', marginBottom: '1.5rem' }}>
                            We sent a 6-digit code to<br />
                            <strong style={{ color: 'var(--color-primary)' }}>{formData.email}</strong>
                        </p>

                        {codeError && (
                            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                                {codeError}
                            </div>
                        )}

                        {resendSuccess && (
                            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                                New code sent to your email!
                            </div>
                        )}

                        <form onSubmit={handleVerifyCode}>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="form-input"
                                placeholder="000000"
                                maxLength={6}
                                style={{
                                    textAlign: 'center',
                                    fontSize: '2rem',
                                    letterSpacing: '0.5rem',
                                    fontWeight: 'bold',
                                    marginBottom: '1.5rem'
                                }}
                                autoFocus
                                required
                            />

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', marginBottom: '1rem' }}
                                disabled={loading || verificationCode.length !== 6}
                            >
                                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
                            </button>
                        </form>

                        <button
                            onClick={handleResendCode}
                            disabled={resendLoading}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-primary)',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            {resendLoading ? 'Sending...' : "Didn't get the code? Resend"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
