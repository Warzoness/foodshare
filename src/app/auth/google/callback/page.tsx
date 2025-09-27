"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/services/site/auth.service';
import { SocialLoginRequest } from '@/types/auth';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        console.log('🔄 Processing Google OAuth callback...');
        
        // Get the credential from URL parameters
        const credential = searchParams.get('credential');
        const error = searchParams.get('error');
        
        if (error) {
          console.error('❌ Google OAuth error:', error);
          setError(`Google OAuth error: ${error}`);
          setLoading(false);
          return;
        }
        
        if (!credential) {
          console.error('❌ No credential found in callback');
          setError('Không tìm thấy thông tin xác thực từ Google');
          setLoading(false);
          return;
        }
        
        console.log('✅ Google credential received:', credential.substring(0, 50) + '...');
        
        // Process the login
        const loginRequest: SocialLoginRequest = {
          provider: 'GOOGLE',
          token: credential
        };
        
        console.log('🔄 Calling AuthService.socialLogin...');
        const response = await AuthService.socialLogin(loginRequest);
        
        console.log('✅ Login successful! Backend response:', response);
        
        // Redirect to intended page or home
        const returnUrl = searchParams.get('returnUrl') || searchParams.get('next') || '/';
        console.log('🔄 Redirecting to:', returnUrl);
        router.push(returnUrl);
        
      } catch (error: any) {
        console.error('❌ Google callback processing error:', error);
        setError(error.message || 'Xử lý đăng nhập Google thất bại');
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Đang xử lý đăng nhập...</h4>
          <p className="text-muted">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5" style={{ maxWidth: 640 }}>
        <div className="text-center">
          <div className="mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10" 
                 style={{ width: '80px', height: '80px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
          </div>
          
          <h4 className="mb-3 text-danger">Đăng nhập thất bại</h4>
          <p className="text-body-secondary mb-4">{error}</p>
          
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/auth/login')}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}