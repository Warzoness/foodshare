"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/site/auth.service';
import { authRedirectService } from '@/services/site/auth-redirect.service';

export interface UseAuthOptions {
  redirectOnUnauthorized?: boolean;
  showNotification?: boolean;
  customMessage?: string;
  redirectTo?: string;
}

export interface UseAuthReturn {
  isAuthenticated: boolean | null;
  isLoading: boolean;
  user: any | null;
  checkAuth: () => Promise<boolean>;
  logout: () => void;
}

/**
 * Hook để quản lý authentication state và tự động xử lý redirect khi chưa đăng nhập
 * @param options - Các tùy chọn cấu hình
 * @returns Object chứa authentication state và methods
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const {
    redirectOnUnauthorized = true,
    showNotification = true,
    customMessage = "Bạn phải đăng nhập để tiếp tục",
    redirectTo = '/auth/login'
  } = options;

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const token = AuthService.getStoredToken();
      const userData = AuthService.getStoredUserData();
      const isLoggedIn = AuthService.isLoggedIn();
      
      console.log('🔍 useAuth: Checking authentication...');
      console.log('  - Token exists:', !!token);
      console.log('  - UserData exists:', !!userData);
      console.log('  - isLoggedIn():', isLoggedIn);
      
      if (!isLoggedIn) {
        console.log('🔒 User not authenticated');
        setIsAuthenticated(false);
        setUser(null);
        
        if (redirectOnUnauthorized) {
          if (showNotification) {
            await authRedirectService.handleUnauthorized({
              showNotification: true,
              redirectDelay: 2000,
              customMessage: customMessage
            });
          } else {
            // Just redirect without notification
            setTimeout(() => {
              router.push(redirectTo);
            }, 100);
          }
        }
        
        return false;
      }
      
      setIsAuthenticated(true);
      setUser(userData);
      console.log('✅ User authenticated');
      return true;
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
      
      if (redirectOnUnauthorized) {
        if (showNotification) {
          await authRedirectService.handleUnauthorized({
            showNotification: true,
            redirectDelay: 2000,
            customMessage: customMessage
          });
        } else {
          setTimeout(() => {
            router.push(redirectTo);
          }, 100);
        }
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user...');
    AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
    
    // Redirect to login page
    router.push(redirectTo);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    checkAuth,
    logout
  };
}

/**
 * Hook đơn giản để kiểm tra authentication mà không tự động redirect
 * @returns Object chứa authentication state
 */
export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isLoggedIn = AuthService.isLoggedIn();
        const userData = AuthService.getStoredUserData();
        
        setIsAuthenticated(isLoggedIn);
        setUser(userData);
      } catch (error) {
        console.error('❌ Auth state check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  return {
    isAuthenticated,
    user
  };
}
