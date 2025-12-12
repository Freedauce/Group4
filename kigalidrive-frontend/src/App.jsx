import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cars from './pages/Cars';
import BookCar from './pages/BookCar';
import MyBookings from './pages/MyBookings';
import AdminApprovals from './pages/AdminApprovals';
import AdminUsers from './pages/AdminUsers';
import Payments from './pages/Payments';
import MyCars from './pages/MyCars';
import AddCar from './pages/AddCar';
import EditCar from './pages/EditCar';
import Reports from './pages/Reports';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <Layout showSidebar={true}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cars" element={<Cars />} />

              {/* Protected Routes - All authenticated users */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <div className="container" style={{ padding: '2rem' }}>
                      <h1>Notifications</h1>
                      <p style={{ color: 'var(--color-gray-400)' }}>Coming soon...</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Client Routes */}
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute allowedRoles={['Client']}>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cars/:id/book"
                element={
                  <ProtectedRoute allowedRoles={['Client']}>
                    <BookCar />
                  </ProtectedRoute>
                }
              />

              {/* Car Owner Routes */}
              <Route
                path="/my-cars"
                element={
                  <ProtectedRoute allowedRoles={['CarOwner']}>
                    <MyCars />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-cars/add"
                element={
                  <ProtectedRoute allowedRoles={['CarOwner']}>
                    <AddCar />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-cars/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['CarOwner']}>
                    <EditCar />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/owner-bookings"
                element={
                  <ProtectedRoute allowedRoles={['CarOwner']}>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payments"
                element={
                  <ProtectedRoute allowedRoles={['CarOwner']}>
                    <Payments />
                  </ProtectedRoute>
                }
              />

              {/* Admin/Manager Routes */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/approvals"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                    <AdminApprovals />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/cars"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                    <Cars />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                    <div className="container" style={{ padding: '2rem' }}>
                      <h1>Reports & Analytics</h1>
                      <p style={{ color: 'var(--color-gray-400)' }}>Advanced reports coming soon...</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="container text-center" style={{ padding: '4rem' }}>
                    <h1 style={{ fontSize: '6rem', marginBottom: '1rem' }}>404</h1>
                    <h2>Page Not Found</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>The page you're looking for doesn't exist.</p>
                  </div>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
