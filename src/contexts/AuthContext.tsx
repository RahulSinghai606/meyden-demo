import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiService } from '@/services/api';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  emailVerified: boolean;
  lastLogin?: string;
  profile?: any;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface AuthContextType {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for stored tokens on mount
  useEffect(() => {
    const storedTokens = localStorage.getItem('meyden_tokens');
    const storedUser = localStorage.getItem('meyden_user');
    
    if (storedTokens && storedUser) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        const parsedUser = JSON.parse(storedUser);
        setTokens(parsedTokens);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('meyden_tokens');
        localStorage.removeItem('meyden_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiService.login({ email, password });
      
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      if (result.data) {
        const { user: userData, tokens: authTokens } = result.data;
        
        setUser(userData);
        setTokens(authTokens);
        
        // Store in localStorage
        localStorage.setItem('meyden_tokens', JSON.stringify(authTokens));
        localStorage.setItem('meyden_user', JSON.stringify(userData));
        
        return { success: true };
      }
      
      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (tokens?.accessToken) {
        await apiService.logout(tokens.accessToken);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setTokens(null);
      setError(null);
      localStorage.removeItem('meyden_tokens');
      localStorage.removeItem('meyden_user');
    }
  };

  const value = {
    user,
    tokens,
    login,
    logout,
    isAuthenticated: !!user && !!tokens,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};