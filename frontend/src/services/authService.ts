import axios from 'axios';
import { User, UsageStats } from '@/types';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Debug: Check if client ID is loaded (without exposing the value)
if (!GOOGLE_CLIENT_ID) {
  console.error('❌ VITE_GOOGLE_CLIENT_ID environment variable not found');
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  usage: UsageStats;
}

export class AuthService {
  private static instance: AuthService;
  private google: any = null;

  private constructor() {
    this.initializeGoogleAuth();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initializeGoogleAuth(): Promise<void> {
    try {
      // Load Google Identity Services script
      if (!document.getElementById('google-identity-script')) {
        const script = document.createElement('script');
        script.id = 'google-identity-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Wait for google object to be available
      let attempts = 0;
      while (!window.google && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (window.google) {
        this.google = window.google;
        console.log('✅ Google Identity Services initialized');
      } else {
        throw new Error('Failed to load Google Identity Services');
      }
    } catch (error) {
      console.error('❌ Error initializing Google Auth:', error);
    }
  }

  public async signInWithGoogle(): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      if (!this.google || !GOOGLE_CLIENT_ID) {
        reject(new Error('Google Auth not initialized or CLIENT_ID missing'));
        return;
      }

      this.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: GoogleCredentialResponse) => {
          try {
            // Send Google token to our backend
            const authResponse = await this.authenticateWithBackend(response.credential);
            resolve(authResponse);
          } catch (error) {
            reject(error);
          }
        },
      });

      // Trigger the sign-in flow
      this.google.accounts.id.prompt();
    });
  }

  public async authenticateWithBackend(googleToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post('/api/auth/google', {
        token: googleToken,
      });

      if (response.data.success) {
        // Store JWT token in localStorage
        const jwtToken = response.data.token;
        localStorage.setItem('auth_token', jwtToken);
        
        // Set default Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;

        return {
          success: true,
          token: jwtToken,
          user: response.data.user,
          usage: response.data.usage,
        };
      } else {
        throw new Error(response.data.message || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('❌ Backend authentication error:', error);
      throw new Error(
        error.response?.data?.detail || 
        error.message || 
        'Authentication failed'
      );
    }
  }

  public async getCurrentUser(): Promise<{ user: User; usage: UsageStats } | null> {
    try {
      const token = this.getStoredToken();
      if (!token) return null;

      const response = await axios.get('/api/auth/me');
      return {
        user: response.data.user,
        usage: response.data.usage,
      };
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      this.logout(); // Clear invalid token
      return null;
    }
  }

  public logout(): void {
    // Remove token from storage
    localStorage.removeItem('auth_token');
    
    // Remove Authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Sign out from Google
    if (this.google?.accounts?.id) {
      this.google.accounts.id.disableAutoSelect();
    }
  }

  public getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  public initializeTokenFromStorage(): void {
    const token = this.getStoredToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  public isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If we can't parse it, consider it expired
    }
  }
}

// Global type declaration for Google Identity Services
declare global {
  interface Window {
    google: any;
  }
}

export const authService = AuthService.getInstance(); 