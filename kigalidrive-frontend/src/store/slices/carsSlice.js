import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    cars: [],
    myCars: [],
    recommendedCars: [],
    selectedCar: null,
    loading: false,
    error: null,
    totalCount: 0,
    page: 1,
    pageSize: 10,
};

export const fetchAvailableCars = createAsyncThunk(
    'cars/fetchAvailable',
    async (searchParams, { rejectWithValue }) => {
        try {
            const response = await api.get('/cars/available', { params: searchParams });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cars');
        }
    }
);

export const fetchMyCars = createAsyncThunk(
    'cars/fetchMyCars',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/cars/my-cars');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch your cars');
        }
    }
);

export const fetchRecommendedCars = createAsyncThunk(
    'cars/fetchRecommended',
    async (count = 5, { rejectWithValue }) => {
        try {
            const response = await api.get('/cars/recommended', { params: { count } });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch recommended cars');
        }
    }
);

export const fetchCarById = createAsyncThunk(
    'cars/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/cars/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch car');
        }
    }
);

export const createCar = createAsyncThunk(
    'cars/create',
    async (carData, { rejectWithValue }) => {
        try {
            const response = await api.post('/cars', carData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create car');
        }
    }
);

export const updateCar = createAsyncThunk(
    'cars/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cars/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update car');
        }
    }
);

export const deleteCar = createAsyncThunk(
    'cars/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/cars/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete car');
        }
    }
);

const carsSlice = createSlice({
    name: 'cars',
    initialState,
    reducers: {
        clearSelectedCar: (state) => {
            state.selectedCar = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAvailableCars.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAvailableCars.fulfilled, (state, action) => {
                state.loading = false;
                state.cars = action.payload.items || action.payload;
                state.totalCount = action.payload.totalCount || action.payload.length;
            })
            .addCase(fetchAvailableCars.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyCars.fulfilled, (state, action) => {
                state.myCars = action.payload;
            })
            .addCase(fetchRecommendedCars.fulfilled, (state, action) => {
                state.recommendedCars = action.payload;
            })
            .addCase(fetchCarById.fulfilled, (state, action) => {
                state.selectedCar = action.payload;
            })
            .addCase(createCar.fulfilled, (state, action) => {
                state.myCars.push(action.payload);
            })
            .addCase(deleteCar.fulfilled, (state, action) => {
                state.myCars = state.myCars.filter(car => car.id !== action.payload);
            });
    },
});

export const { clearSelectedCar, clearError } = carsSlice.actions;
export default carsSlice.reducer;
