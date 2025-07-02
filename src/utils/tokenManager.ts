import Cookies from 'js-cookie';

export class TokenManager {
  static getToken(): string | null {
    return Cookies.get('token') || null;
  }

  static getRefreshToken(): string | null {
    return Cookies.get('refreshToken') || null;
  }

  static setTokens(token: string, refreshToken: string): void {
    Cookies.set('token', token, { expires: 1/96 }); // 15 minutes
    Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days
  }

  static clearTokens(): void {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
  }

  static isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT: does not have 3 parts');
        return true; // Invalid token structure
      }
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      if (!decoded || typeof decoded.exp !== 'number') {
        console.error('Invalid JWT: payload missing or exp not a number');
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding or parsing JWT in isTokenExpired:', error);
      return true;
    }
  }

  static getTokenPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT: does not have 3 parts');
        return null; // Invalid token structure
      }
      const payload = parts[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decoding or parsing JWT in getTokenPayload:', error);
      return null;
    }
  }

  static shouldRefreshToken(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT: does not have 3 parts');
        return true; // Invalid token structure, assume refresh needed
      }
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));

      if (!decoded || typeof decoded.exp !== 'number') {
        console.error('Invalid JWT: payload missing or exp not a number');
        return true; // Cannot determine expiry, assume refresh needed
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - currentTime;
      
      // Refresh if token expires in less than 5 minutes (300 seconds)
      return timeUntilExpiry < 300;
    } catch (error) {
      return true;
    }
  }
}