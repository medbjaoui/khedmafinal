import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/authService';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_TIMEOUT = 30 * 1000; // 30 seconds

export const useIdleTimer = () => {
  const [isIdle, setIsIdle] = useState(false);

  const handleSignOut = useCallback(() => {
    AuthService.signOut().then(() => {
      window.location.href = '/login'; // Redirect to login page
    });
  }, []);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
  }, []);

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    const onIdle = () => {
      warningTimer = setTimeout(() => {
        setIsIdle(true);
      }, IDLE_TIMEOUT - WARNING_TIMEOUT);

      idleTimer = setTimeout(handleSignOut, IDLE_TIMEOUT);
    };

    const handleActivity = () => {
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      resetTimer();
      onIdle();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    onIdle();

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [handleSignOut, resetTimer]);

  return { isIdle, resetTimer, handleSignOut };
};
