"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthService } from "@/services/site/auth.service";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        console.log('🔄 Processing Google OAuth callback...');
        
        // Get parameters from URL
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');
        const credential = searchParams.get('credential');
        
        if (error) {
          console.error('❌ Google OAuth error:', error);
          setError(`Lỗi đăng nhập Google: ${error}`);
          setLoading(false);
          return;
        }
        
        // Check for either code (OAuth flow) or credential (GSI flow)
        if (!code && !credential) {
          console.error('❌ No authorization code or credential received from Google');
          setError('Không nhận được mã xác thực từ Google');
          setLoading(false);
          return;
        }
        
        console.log('✅ Google authorization received:', code ? code.substring(0, 20) + '...' : 'credential flow');
        
        // Parse state to get return URL
        let returnUrl = '/';
        try {
          if (state) {
            const stateData = JSON.parse(decodeURIComponent(state));
            returnUrl = stateData.returnUrl || '/';
          }
        } catch {
          console.warn('⚠️ Could not parse state parameter');
        }
        
        // For now, we'll use the code as the token
        // In a real implementation, you'd exchange the code for an access token
        const token = credential || code;
        if (!token) {
          setError('Không có token từ Google');
          setLoading(false);
          return;
        }
        
        const response = await AuthService.socialLogin({
          provider: 'GOOGLE',
          token: token
        });
        
        console.log('✅ Google login successful:', response);
        
        // Redirect to home or return URL
        router.push(returnUrl);
        
      } catch (error: unknown) {
        console.error('❌ Google callback error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(errorMessage || 'Lỗi xử lý đăng nhập Google');
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #54a65c',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <h2>Đang xử lý đăng nhập...</h2>
        <p>Vui lòng đợi trong giây lát</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
        <h2>Đăng nhập thất bại</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
        <button
          onClick={() => router.push('/auth/login')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#54a65c',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return null;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div>Đang xử lý...</div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
