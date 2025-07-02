import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cvReducer from './slices/cvSlice';
import jobsReducer from './slices/jobsSlice';
import applicationsReducer from './slices/applicationsSlice';
import userReducer from './slices/userSlice';
import profileReducer from './slices/profileSlice';
import aiReducer from './slices/aiSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cv: cvReducer,
    jobs: jobsReducer,
    applications: applicationsReducer,
    user: userReducer,
    profile: profileReducer,
    ai: aiReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;