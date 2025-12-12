import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useRef } from 'react';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { theme, toggleTheme } = useTheme();
    const canvasRef = useRef(null);

    // Animated particles background
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            particles = [];
            const count = Math.floor(window.innerWidth / 15);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 1,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random() * 0.5 + 0.2
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(20, 184, 166, ${p.opacity})`;
                ctx.fill();

                // Connect nearby particles
                particles.slice(i + 1).forEach(p2 => {
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(20, 184, 166, ${0.1 * (1 - dist / 100)})`;
                        ctx.stroke();
                    }
                });
            });

            animationId = requestAnimationFrame(animate);
        };

        resize();
        createParticles();
        animate();

        window.addEventListener('resize', () => {
            resize();
            createParticles();
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    const features = [
        { icon: '🚗', title: 'Wide Selection', description: 'Choose from hundreds of quality vehicles for any occasion' },
        { icon: '📱', title: 'Easy Booking', description: 'Book your car in minutes with our streamlined process' },
        { icon: '💳', title: 'Secure Payments', description: 'Safe and transparent payment processing' },
        { icon: '📍', title: 'GPS Tracking', description: 'Real-time vehicle tracking for peace of mind' },
        { icon: '🔧', title: 'Maintenance Records', description: 'Full maintenance history for every vehicle' },
        { icon: '📊', title: 'Analytics Dashboard', description: 'Track your earnings and performance in real-time' },
    ];

    const stats = [
        { value: '500+', label: 'Vehicles Listed' },
        { value: '10K+', label: 'Happy Customers' },
        { value: '98%', label: 'Satisfaction Rate' },
        { value: '24/7', label: 'Customer Support' },
    ];

    return (
        <div className="home-page">
            {/* Animated Particle Background */}
            <canvas ref={canvasRef} className="particle-canvas" />

            {/* Floating 3D Cars */}
            <div className="floating-elements">
                <div className="floating-car car-1">🚗</div>
                <div className="floating-car car-2">🚙</div>
                <div className="floating-car car-3">🏎️</div>
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
            </div>

            {/* Navigation */}
            <nav className="home-nav">
                <div className="container">
                    <div className="home-nav-content">
                        <Link to="/" className="home-logo">
                            Kigali<span>Drive</span>
                        </Link>

                        <div className="home-nav-links">
                            <Link to="/cars">Browse Cars</Link>
                            <button onClick={toggleTheme} className="theme-toggle">
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-secondary">Sign In</Link>
                                    <Link to="/register" className="btn btn-primary">Get Started</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-grid">
                        <div className="hero-content">
                            <span className="hero-badge">🚀 Rwanda's #1 Platform</span>
                            <h1 className="hero-title">
                                Revolutionize Car Rental
                                <span className="text-accent"> Management & Bookings</span>
                            </h1>
                            <p className="hero-description">
                                The complete platform for car rentals in Kigali. Whether you want to
                                rent a car or list your vehicle, we've got you covered with seamless
                                booking, secure payments, and real-time tracking.
                            </p>
                            <div className="hero-buttons">
                                <Link to="/register" className="btn btn-primary btn-lg btn-glow">
                                    Get Started Free
                                </Link>
                                <Link to="/cars" className="btn btn-secondary btn-lg">
                                    Browse Cars
                                </Link>
                            </div>

                            <div className="hero-stats">
                                {stats.map((stat, index) => (
                                    <div key={index} className="hero-stat">
                                        <div className="hero-stat-value">{stat.value}</div>
                                        <div className="hero-stat-label">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="hero-image">
                            <div className="hero-3d-container">
                                <div className="hero-car-wrapper">
                                    <div className="glow-ring ring-1"></div>
                                    <div className="glow-ring ring-2"></div>
                                    <div className="glow-ring ring-3"></div>
                                    <img
                                        src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"
                                        alt="Luxury car"
                                        className="hero-car-image"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - White Background */}
            <section className="section section-white">
                <div className="container">
                    <h2 className="section-title">Designed for Everyone</h2>
                    <p className="section-subtitle">
                        Whether you're a car owner looking to earn extra income or a traveler
                        seeking the perfect ride, our platform has you covered.
                    </p>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Management Suite Section */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Complete Rental Management Suite</h2>
                    <p className="section-subtitle">
                        Everything you need to manage your car rental business, all in one place.
                    </p>

                    <div className="management-grid">
                        <div className="management-card card-3d">
                            <div className="management-icon">👥</div>
                            <h3>For Car Owners</h3>
                            <ul>
                                <li>✓ List your vehicles easily</li>
                                <li>✓ Set your own prices</li>
                                <li>✓ Track bookings in real-time</li>
                                <li>✓ Receive secure payments</li>
                                <li>✓ Analytics dashboard</li>
                            </ul>
                            <Link to="/register?role=owner" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                List Your Car
                            </Link>
                        </div>

                        <div className="management-card card-3d featured">
                            <div className="featured-badge">Most Popular</div>
                            <div className="management-icon">🚗</div>
                            <h3>For Renters</h3>
                            <ul>
                                <li>✓ Browse verified vehicles</li>
                                <li>✓ Book instantly</li>
                                <li>✓ Secure payment options</li>
                                <li>✓ Direct owner contact</li>
                                <li>✓ 24/7 support</li>
                            </ul>
                            <Link to="/cars" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                Find a Car
                            </Link>
                        </div>

                        <div className="management-card card-3d">
                            <div className="management-icon">📊</div>
                            <h3>For Administrators</h3>
                            <ul>
                                <li>✓ User management</li>
                                <li>✓ Booking oversight</li>
                                <li>✓ Revenue tracking</li>
                                <li>✓ Platform analytics</li>
                                <li>✓ Approval workflows</li>
                            </ul>
                            <Link to="/login" className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
                                Admin Login
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard Preview Section - White */}
            <section className="section section-white">
                <div className="container">
                    <h2 className="section-title">Unified Dashboard Experience</h2>
                    <p className="section-subtitle">
                        Manage everything from one intuitive dashboard designed for efficiency.
                    </p>

                    <div className="dashboard-preview">
                        <img
                            src="https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200&q=80"
                            alt="Dashboard preview"
                            className="dashboard-image"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <h2 className="cta-title">Ready to Revolutionize Your Rentals?</h2>
                    <p className="cta-description">
                        Join thousands of car owners and renters who trust KigaliDrive for their transportation needs.
                    </p>
                    <div className="cta-buttons">
                        <Link to="/register" className="btn btn-primary btn-lg btn-glow">
                            Create Free Account
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div>
                            <div className="footer-brand">Kigali<span>Drive</span></div>
                            <p className="footer-description">
                                Rwanda's leading car rental platform connecting car owners with
                                travelers across the country.
                            </p>
                        </div>

                        <div>
                            <h4 className="footer-title">Platform</h4>
                            <ul className="footer-links">
                                <li><Link to="/cars">Browse Cars</Link></li>
                                <li><Link to="/register">List Your Car</Link></li>
                                <li><Link to="/login">Sign In</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="footer-title">Company</h4>
                            <ul className="footer-links">
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Careers</a></li>
                                <li><a href="#">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="footer-title">Legal</h4>
                            <ul className="footer-links">
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Terms of Service</a></li>
                                <li><a href="#">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        © 2024 KigaliDrive. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
