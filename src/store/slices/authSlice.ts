import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthService } from '../../services/authService';
import { SupabaseService } from '../../services/supabaseService';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'User' | 'Premium';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  sessionExpiry: number | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  sessionExpiry: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await AuthService.signIn(credentials.email, credentials.password);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur de connexion');
    }
  }
);

export const signUpUser = createAsyncThunk(
  'auth/signup',
  async (data: { email: string; password: string; firstName: string; lastName: string }, { rejectWithValue }) => {
    try {
      const response = await AuthService.signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName
      });
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur d\'inscription');
    }
  }
);

export const refreshUserToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.refreshToken();
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur de rafraîchissement du token');
    }
  }
);

export const restoreUserSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const hasSession = await AuthService.hasValidSession();
      
      if (!hasSession) {
        return rejectWithValue('No valid session');
      }
      
      const user = await AuthService.getCurrentUser();
      
      if (!user) {
        return rejectWithValue('No user found');
      }
      
      // Get user profile for additional info
      const profile = await SupabaseService.getUserProfile(user.id);
      
      if (profile) {
        user.firstName = profile.firstName;
        user.lastName = profile.lastName;
      }
      
      return {
        user,
        token: 'session-token', // Actual token is managed by Supabase client
        refreshToken: 'session-refresh-token'
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur de restauration de session');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.signOut();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Still return success to ensure user is logged out on client side
      return true;
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await AuthService.resetPassword(email);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Erreur lors de la réinitialisation du mot de passe');
      }
      
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur lors de la réinitialisation du mot de passe');
    }
  }
);

export const updateUserPassword = createAsyncThunk(
  'auth/updatePassword',
  async (password: string, { rejectWithValue }) => {
    try {
      const response = await AuthService.updatePassword(password);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Erreur lors de la mise à jour du mot de passe');
      }
      
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du mot de passe');
    }
  }
);

export const updateUserMetadata = createAsyncThunk(
  'auth/updateMetadata',
  async (metadata: { firstName?: string; lastName?: string; role?: string }, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await AuthService.updateUserMetadata(metadata);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Erreur lors de la mise à jour des informations utilisateur');
      }
      
      // Update user in state
      const state = getState() as { auth: AuthState };
      if (state.auth.user) {
        dispatch(updateUserInfo({
          firstName: metadata.firstName || state.auth.user.firstName,
          lastName: metadata.lastName || state.auth.user.lastName,
          role: metadata.role as 'Admin' | 'User' | 'Premium' || state.auth.user.role
        }));
      }
      
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Erreur lors de la mise à jour des informations utilisateur');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateUserInfo: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    updateLastLogin: (state) => {
      if (state.user) {
        state.user.lastLogin = new Date().toISOString();
      }
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.sessionExpiry = Date.now() + (15 * 60 * 1000); // 15 minutes
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
    });
    
    // Sign Up
    builder.addCase(signUpUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signUpUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = !!action.payload.user;
      if (action.payload.user) {
        state.sessionExpiry = Date.now() + (15 * 60 * 1000); // 15 minutes
      }
      state.error = null;
    });
    builder.addCase(signUpUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Refresh Token
    builder.addCase(refreshUserToken.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(refreshUserToken.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.sessionExpiry = Date.now() + (15 * 60 * 1000);
    });
    builder.addCase(refreshUserToken.rejected, (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.sessionExpiry = null;
    });
    
    // Restore Session
    builder.addCase(restoreUserSession.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(restoreUserSession.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.sessionExpiry = Date.now() + (15 * 60 * 1000);
    });
    builder.addCase(restoreUserSession.rejected, (state) => {
      state.loading = false;
      // Don't set error here as this is a background operation
    });
    
    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.sessionExpiry = null;
      state.error = null;
    });
    
    // Reset Password
    builder.addCase(resetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Update Password
    builder.addCase(updateUserPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUserPassword.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(updateUserPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { updateUserInfo, updateLastLogin, clearError } = authSlice.actions;
export default authSlice.reducer;