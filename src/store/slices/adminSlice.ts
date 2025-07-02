import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  totalUsers: number | null;
  unresolvedAlerts: number | null;
  // Add other admin-related stats here as needed
}

const initialState: AdminState = {
  totalUsers: null,
  unresolvedAlerts: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminStats: (state, action: PayloadAction<{ totalUsers: number; unresolvedAlerts: number }>) => {
      state.totalUsers = action.payload.totalUsers;
      state.unresolvedAlerts = action.payload.unresolvedAlerts;
    },
    clearAdminStats: (state) => {
      state.totalUsers = null;
      state.unresolvedAlerts = null;
    },
  },
});

export const { setAdminStats, clearAdminStats } = adminSlice.actions;
export default adminSlice.reducer;
