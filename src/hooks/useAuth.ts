import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { refreshUserToken } from '../store/slices/authSlice';
import { TokenManager } from '../utils/tokenManager';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated, user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Check if token needs refresh
      if (TokenManager.shouldRefreshToken(token)) {
        dispatch(refreshUserToken());
      }

      // Set up interval to check token expiry
      const interval = setInterval(() => {
        if (TokenManager.shouldRefreshToken(token)) {
          dispatch(refreshUserToken());
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [dispatch, token, isAuthenticated]);

  return {
    isAuthenticated,
    user,
    token
  };
};