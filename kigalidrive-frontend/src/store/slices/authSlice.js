import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            if (response.data.success) {
                // Admin/Manager get token directly, others get verification code
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                return response.data;
            }
            return rejectWithValue(response.data.message);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const verifyCode = createAsyncThunk(
    'auth/verifyCode',
    async ({ email, code }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/verify-code', { email, code });
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return response.data;
            }
            return rejectWithValue(response.data.message);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Verification failed');
        }
    }
);

export const resendCode = createAsyncThunk(
    'auth/resendCode',
    async (email, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/resend-code', { email });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to resend code');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data.success) {
                return response.data;
            }
            return rejectWithValue(response.data.message);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Request failed');
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ token, newPassword }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/reset-password', { token, newPassword });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Reset failed');
        }
    }
);

export const googleLogin = createAsyncThunk(
    'auth/googleLogin',
    async ({ credential, role }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/google', { credential, role });
            if (response.data.success) {
                // Google login returns token directly
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                return response.data;
            }
            return rejectWithValue(response.data.message);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Google login failed');
        }
    }
);



const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                // Only authenticate if token returned (Admin/Manager bypass 2FA)
                if (action.payload.token) {
                    state.isAuthenticated = true;
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(googleLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.token) {
                    state.isAuthenticated = true;
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                }
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(verifyCode.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyCode.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(verifyCode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
