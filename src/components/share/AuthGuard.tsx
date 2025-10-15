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
    const checkAuth = () => {
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

  // const handleLogin = () => {
  //   // Check if on mobile device
  //   const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  //                    window.innerWidth <= 768;
    
  //   if (isMobile) {
  //     // On mobile, always use redirect flow for better compatibility
  //     console.log('📱 Mobile device detected, using redirect flow');
  //     const loginUrl = redirectTo;
  //     window.location.href = loginUrl;
  //   } else {
  //     // On desktop, use normal navigation
  //     console.log('🖥️ Desktop device detected, using navigation');
  //     router.push(redirectTo);
  //   }
  // };

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
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #3ea25a 0%, #2d7a47 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
          background: 'transparent',
          borderRadius: '20px',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Social Login Buttons */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1.5rem',
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Đăng nhập
            </h3>
            
            <div style={{
              width: '100%',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '40px',
              position: 'relative',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <button 
                className="btn btn-light btn-lg w-100"
                onClick={() => router.push('/auth/login')}
                style={{
                  borderRadius: '16px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  height: '56px',
                  border: '2px solid #e5e7eb',
                  background: '#ffffff',
                  color: '#3c4043',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng nhập với Google
              </button>
            </div>
          </div>

          {/* Skip Button */}
          <div style={{ textAlign: 'center' }}>
            <button 
              className="btn btn-outline-light"
              onClick={() => router.push('/')}
              style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.9rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
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