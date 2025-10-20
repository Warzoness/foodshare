"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/site/auth.service';
import LoadingSpinner from "@/components/share/LoadingSpinner";

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
    const checkAuth = async () => {
      try {
        // Debug: Check individual components
        const token = AuthService.getStoredToken();
        const userData = AuthService.getStoredUserData();
        const isLoggedIn = AuthService.isLoggedIn();
        
        console.log('🔍 AuthGuard Debug:');
        console.log('  - Token exists:', !!token);
        console.log('  - UserData exists:', !!userData);
        console.log('  - isLoggedIn():', isLoggedIn);
        console.log('  - Token preview:', token?.substring(0, 20) + '...');
        console.log('  - UserData keys:', userData ? Object.keys(userData) : 'null');
        
        if (!isLoggedIn) {
          console.log('🔒 User not authenticated, showing login prompt');
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
  }, [redirectTo]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          {/*<span className="visually-hidden">Đang kiểm tra đăng nhập...</span>*/}
          <LoadingSpinner message="Đang kiểm tra đăng nhập..." />
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    const handleLoginClick = () => {
      const currentPath = window.location.pathname;
      const loginUrl = `${redirectTo}?returnUrl=${encodeURIComponent(currentPath)}`;
      console.log('🔄 Redirecting to login:', loginUrl);
      window.location.href = loginUrl;
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #3ea25a 0%, #2d7a47 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {/* Brand */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1
        }}>
          <span style={{
            fontFamily: 'Georgia, serif',
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(255, 255, 255, 0.7)',
            textUnderlineOffset: '8px'
          }}>
            FoodShare
          </span>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '420px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Login Content */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#3ea25a',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 8px 20px rgba(62, 162, 90, 0.3)'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '0.5rem'
            }}>
              Đăng nhập để tiếp tục
            </h2>
            
            <p style={{
              fontSize: '1rem',
              color: '#718096',
              marginBottom: '2rem',
              lineHeight: '1.5'
            }}>
              Bạn cần đăng nhập để xem đơn hàng và sử dụng các tính năng khác
            </p>
            
            {/* Login Button */}
            <button 
              onClick={handleLoginClick}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '500',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #3ea25a 0%, #2d7a47 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(62, 162, 90, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '1.5rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(62, 162, 90, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(62, 162, 90, 0.3)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập với Google
            </button>

            {/* Skip Button */}
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                color: '#718096',
                textDecoration: 'none',
                fontSize: '0.9rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f7fafc';
                e.currentTarget.style.borderColor = '#cbd5e0';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              Bỏ qua đăng nhập
            </button>
          </div>
        </div>

        {/* Decorative Frame */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            bottom: '20px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px'
          }} />
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  return <>{children}</>;
}