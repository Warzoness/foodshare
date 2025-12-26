"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/site/auth.service';
import { handleFirebaseTokenAfterLogin } from '@/lib/firebase';

// Remove global declaration to avoid conflicts

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Detect if device is mobile with improved accuracy
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    
    // Check user agent
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Check screen size
    const isMobileScreen = window.innerWidth <= 768;
    
    // Check touch capability
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Mobile if any of these conditions are true
    return isMobileUA || (isMobileScreen && isTouchDevice);
  };

  useEffect(() => {
    // Only load Google Identity Services on desktop
    if (isMobile()) {
      return;
    }

    // Load Google Identity Services for desktop
    const loadGoogleScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google) {
          resolve(window.google);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google);
        script.onerror = () => reject(new Error('Failed to load Google script'));
        document.head.appendChild(script);
      });
    };

    loadGoogleScript().then(() => {
      if (window.google) {
        (window.google as any).accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '62641073672-3rjbtjt32kkng905ebr2nfebq3i18cl3.apps.googleusercontent.com',
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });
      }
    }).catch(error => {
      console.error('Failed to load Google Identity Services:', error);
      onError?.('Failed to load Google login');
    });
  // Move handleCredentialResponse above useEffect to avoid usage before declaration
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onError]);

  const handleCredentialResponse = async (response: any) => {
    try {
      setIsLoading(true);

      // Call your backend to verify the token
      await AuthService.socialLogin({
        provider: 'GOOGLE',
        token: response.credential
      });

      // Sau khi login thành công, xử lý Firebase token
      handleFirebaseTokenAfterLogin();

      onSuccess?.();
      
      // Redirect to orders page or reload
      window.location.reload();
    } catch (error) {
      console.error('Login failed:', error);
      onError?.(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      if (isMobile()) {
        console.log('📱 Mobile device detected, using mobile-optimized login flow');
        
        // On mobile, try popup first, fallback to redirect
        if (window.google) {
          try {
            console.log('🔄 Attempting Google popup on mobile...');
            (window.google as any).accounts.id.prompt();
          } catch (popupError) {
            console.warn('⚠️ Popup failed on mobile, falling back to redirect:', popupError);
            // Show user-friendly message before redirect
            if (confirm('Popup có thể bị chặn trên mobile. Bạn có muốn chuyển đến trang đăng nhập không?')) {
              window.location.href = '/auth/login';
            }
          }
        } else {
          console.log('🔄 Google SDK not loaded, redirecting to login page');
          window.location.href = '/auth/login';
        }
        return;
      }

      // On desktop, use Google Identity Services popup
      console.log('🖥️ Desktop device detected, using popup login');
      if (window.google) {
        (window.google as any).accounts.id.prompt();
      } else {
        // Fallback to redirect
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('❌ Google login failed:', error);
      onError?.(error instanceof Error ? error.message : 'Đăng nhập Google thất bại');
      
      // Fallback to redirect
      if (isMobile()) {
        window.location.href = '/auth/login';
      } else {
        router.push('/auth/login');
      }
    }
  };

  return (
    <button 
      className="btn btn-success btn-lg px-4"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      style={{ 
        borderRadius: '12px',
        padding: '12px 32px',
        fontSize: '16px',
        fontWeight: '600',
        backgroundColor: '#28a745',
        borderColor: '#28a745'
      }}
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </span>
          Đang đăng nhập...
        </>
      ) : (
        'Đăng nhập ngay'
      )}
    </button>
  );
}
