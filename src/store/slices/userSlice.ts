import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  experience: string;
  skills: string[];
  avatar?: string;
}

interface UserState {
  profile: UserProfile | null;
  preferences: {
    autoApply: boolean;
    emailNotifications: boolean;
    language: 'fr' | 'ar';
    jobAlerts: boolean;
  };
  onboarded: boolean;
}

const initialState: UserState = {
  profile: null,
  preferences: {
    autoApply: false,
    emailNotifications: true,
    language: 'fr',
    jobAlerts: true,
  },
  onboarded: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    updatePreferences: (state, action: PayloadAction<Partial<typeof initialState.preferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setOnboarded: (state, action: PayloadAction<boolean>) => {
      state.onboarded = action.payload;
    },
  },
});

export const { updateProfile, updatePreferences, setOnboarded } = userSlice.actions;
export default userSlice.reducer;