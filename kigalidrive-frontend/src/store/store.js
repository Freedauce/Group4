import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import carsReducer from './slices/carsSlice';
import bookingsReducer from './slices/bookingsSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cars: carsReducer,
        bookings: bookingsReducer,
        notifications: notificationsReducer,
    },
});

export default store;
