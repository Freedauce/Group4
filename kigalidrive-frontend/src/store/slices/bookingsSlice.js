import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    bookings: [],
    myBookings: [],
    ownerBookings: [],
    selectedBooking: null,
    loading: false,
    error: null,
};

export const fetchAllBookings = createAsyncThunk(
    'bookings/fetchAll',
    async ({ page = 1, pageSize = 10 }, { rejectWithValue }) => {
        try {
            const response = await api.get('/bookings', { params: { page, pageSize } });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
        }
    }
);

export const fetchMyBookings = createAsyncThunk(
    'bookings/fetchMy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/bookings/my-bookings');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch your bookings');
        }
    }
);

export const fetchOwnerBookings = createAsyncThunk(
    'bookings/fetchOwner',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/bookings/owner-bookings');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
        }
    }
);

export const createBooking = createAsyncThunk(
    'bookings/create',
    async (bookingData, { rejectWithValue }) => {
        try {
            const response = await api.post('/bookings', bookingData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
        }
    }
);

export const updateBookingStatus = createAsyncThunk(
    'bookings/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/bookings/${id}/status`, { status });
            return { id, status, message: response.data.message };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update booking');
        }
    }
);

export const cancelBooking = createAsyncThunk(
    'bookings/cancel',
    async (id, { rejectWithValue }) => {
        try {
            await api.post(`/bookings/${id}/cancel`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
        }
    }
);

const bookingsSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllBookings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.bookings = action.payload.items || action.payload;
            })
            .addCase(fetchAllBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyBookings.fulfilled, (state, action) => {
                state.myBookings = action.payload;
            })
            .addCase(fetchOwnerBookings.fulfilled, (state, action) => {
                state.ownerBookings = action.payload;
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.myBookings.unshift(action.payload);
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                const updateBooking = (bookings) =>
                    bookings.map(b => b.id === action.payload ? { ...b, status: 'Cancelled' } : b);
                state.myBookings = updateBooking(state.myBookings);
                state.ownerBookings = updateBooking(state.ownerBookings);
            });
    },
});

export const { clearError } = bookingsSlice.actions;
export default bookingsSlice.reducer;
