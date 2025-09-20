"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/site/auth.service';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isLoggedIn = AuthService.isLoggedIn();
        if (!isLoggedIn) {
          console.log('🔒 User not authenticated, redirecting to login');
          router.push(redirectTo);
          return;
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  return <>{children}</>;
}