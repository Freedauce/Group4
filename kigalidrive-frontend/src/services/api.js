import axios from 'axios';

const API_BASE_URL = 'http://localhost:5139/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    changePassword: (data) => api.post('/auth/change-password', data),
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
};

// Cars API
export const carsAPI = {
    getAll: (params) => api.get('/cars', { params }),
    getAvailable: (params) => api.get('/cars/available', { params }),
    getRecommended: (count) => api.get('/cars/recommended', { params: { count } }),
    getMyCars: () => api.get('/cars/my-cars'),
    getById: (id) => api.get(`/cars/${id}`),
    create: (data) => api.post('/cars', data),
    update: (id, data) => api.put(`/cars/${id}`, data),
    delete: (id) => api.delete(`/cars/${id}`),
    getPending: () => api.get('/cars/pending'),
    approve: (id, status) => api.post(`/cars/${id}/approve`, { status }),
};

// Bookings API
export const bookingsAPI = {
    getAll: (params) => api.get('/bookings', { params }),
    getMyBookings: () => api.get('/bookings/my-bookings'),
    getOwnerBookings: () => api.get('/bookings/owner-bookings'),
    getById: (id) => api.get(`/bookings/${id}`),
    create: (data) => api.post('/bookings', data),
    updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
    cancel: (id) => api.post(`/bookings/${id}/cancel`),
};

// Payments API
export const paymentsAPI = {
    getByBookingId: (bookingId) => api.get(`/payments/booking/${bookingId}`),
    getMyPayments: () => api.get('/payments/my-payments'),
    getPending: () => api.get('/payments/pending'),
    updateStatus: (id, data) => api.put(`/payments/${id}/status`, data),
};

// Users API
export const usersAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    getPendingApprovals: () => api.get('/users/pending-approvals'),
    approve: (id, status) => api.post(`/users/${id}/approve`, { approvalStatus: status }),
    createInternal: (data) => api.post('/users/internal', data),
    deactivate: (id) => api.post(`/users/${id}/deactivate`),
    reactivate: (id) => api.post(`/users/${id}/reactivate`),
    delete: (id) => api.delete(`/users/${id}`),
};

// Reports API
export const reportsAPI = {
    getDashboard: () => api.get('/reports/dashboard'),
    getBookingsByMonth: (year) => api.get('/reports/bookings-by-month', { params: { year } }),
    getCarsByType: () => api.get('/reports/cars-by-type'),
    getRevenue: (startDate, endDate) => api.get('/reports/revenue', { params: { startDate, endDate } }),
    getOwnerStats: () => api.get('/reports/owner-stats'),
    getClientStats: () => api.get('/reports/client-stats'),
};

// Notifications API
export const notificationsAPI = {
    getAll: () => api.get('/notifications'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.post(`/notifications/${id}/read`),
    markAllAsRead: () => api.post('/notifications/read-all'),
};
