import { supabase } from './supabaseService';
import { User } from '../store/slices/authSlice';
import { TokenManager } from '../utils/tokenManager';

export interface LoginHistoryEntry {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface AuthResponse {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  error?: string;
}

export class AuthService {
  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Invoke the Supabase Edge Function to handle sign-in and logging
      const { data, error } = await supabase.functions.invoke('sign-in-with-log', {
        body: { email, password },
      });

      if (error) {
        // If the function returns a specific error message, use it
        if (data?.error) {
          throw new Error(data.error);
        }
        throw error;
      }

      // The function returns the session data inside the 'data' property
      const { user: authUser, session } = data;

      if (!authUser || !session) {
        throw new Error('Échec de la connexion: Données de session non valides');
      }

      // Manually set the session for the Supabase client
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      // Store tokens in cookies
      TokenManager.setTokens(
        session.access_token,
        session.refresh_token
      );

      const userData: User = {
        id: authUser.id,
        email: authUser.email!,
        firstName: authUser.user_metadata?.first_name || 'Utilisateur',
        lastName: authUser.user_metadata?.last_name || '',
        role: authUser.user_metadata?.role || 'User',
        createdAt: authUser.created_at,
        lastLogin: new Date().toISOString(),
        isActive: true
      };

      return {
        user: userData,
        token: session.access_token,
        refreshToken: session.refresh_token
      };
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      return {
        user: null,
        token: null,
        refreshToken: null,
        error: errorMessage
      };
    }
  }

  // Sign up with email and password
  static async signUp(
    email: string, 
    password: string, 
    userData: { firstName: string; lastName: string }
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: 'User' // Default role for new users
          }
        }
      });

      if (error) throw error;

      if (!data.user) {
        return {
          user: null,
          token: null,
          refreshToken: null,
          error: 'Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.'
        };
      }

      // Store tokens in cookies
      if (data.session) {
        TokenManager.setTokens(
          data.session.access_token,
          data.session.refresh_token
        );
      }

      const newUser: User = {
        id: data.user.id,
        email: data.user.email!,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'User',
        createdAt: data.user.created_at,
        lastLogin: new Date().toISOString(),
        isActive: true
      };

      return {
        user: newUser,
        token: data.session?.access_token || null,
        refreshToken: data.session?.refresh_token || null
      };
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'inscription';
      return {
        user: null,
        token: null,
        refreshToken: null,
        error: errorMessage
      };
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      TokenManager.clearTokens();
    } catch (error) {
      console.error('Sign out error:', error);
      // Clear tokens anyway to ensure user is logged out on client side
      TokenManager.clearTokens();
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      return {
        id: user.id,
        email: user.email!,
        firstName: user.user_metadata?.first_name || 'Utilisateur',
        lastName: user.user_metadata?.last_name || '',
        role: user.user_metadata?.role || 'User',
        createdAt: user.created_at,
        lastLogin: user.last_sign_in_at || new Date().toISOString(),
        isActive: true
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Refresh token
  static async refreshToken(): Promise<{
    token: string | null;
    refreshToken: string | null;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) throw error;

      if (!data.session) {
        throw new Error('Failed to refresh session');
      }

      // Update stored tokens
      TokenManager.setTokens(
        data.session.access_token,
        data.session.refresh_token
      );

      return {
        token: data.session.access_token,
        refreshToken: data.session.refresh_token
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur de rafraîchissement du token';
      return {
        token: null,
        refreshToken: null,
        error: errorMessage
      };
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la réinitialisation du mot de passe';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Update password
  static async updatePassword(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du mot de passe';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Update user metadata
  static async updateUserMetadata(metadata: {
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: metadata.firstName,
          last_name: metadata.lastName,
          role: metadata.role
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Update user metadata error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour des informations utilisateur';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Verify if user has a valid session
  static async hasValidSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  // Get user's login history
  static async getLoginHistory(): Promise<{ data: LoginHistoryEntry[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10); // Get the last 10 login events

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching login history:', error);
      return { data: null, error };
    }
  }
}