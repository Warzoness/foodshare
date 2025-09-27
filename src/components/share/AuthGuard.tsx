"use client";

import { useEffect, useState } from 'react';
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isLoggedIn = AuthService.isLoggedIn();
        if (!isLoggedIn) {
          console.log('🔒 User not authenticated');
          setIsAuthenticated(false);
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    // Check if on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth <= 768;
    
    if (isMobile) {
      // On mobile, always use redirect flow for better compatibility
      console.log('📱 Mobile device detected, using redirect flow');
      const loginUrl = redirectTo;
      window.location.href = loginUrl;
    } else {
      // On desktop, use normal navigation
      console.log('🖥️ Desktop device detected, using navigation');
      router.push(redirectTo);
    }
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang kiểm tra đăng nhập...</span>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-5" style={{ maxWidth: 640 }}>
        <div className="text-center">
          <div className="mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light" 
                 style={{ width: '80px', height: '80px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
          
          <h4 className="mb-3 fw-bold">Vui lòng đăng nhập</h4>
          <p className="text-body-secondary mb-4">
            Bạn cần đăng nhập để xem đơn hàng của mình
          </p>
          
          <button 
            className="btn btn-success btn-lg px-4"
            onClick={() => router.push('/auth/login')}
            style={{ 
              borderRadius: '12px',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: '#28a745',
              borderColor: '#28a745'
            }}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  return <>{children}</>;
}