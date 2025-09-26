"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./Login.module.css";
import Link from "next/link";
import { AuthService } from "@/services/site/auth.service";
import { SocialLoginRequest } from "@/types/auth";

// Declare global types for SDKs
declare global {
  interface Window {
    google: unknown;
    FB: unknown;
    googleSDKLoaded: boolean;
    facebookSDKLoaded: boolean;
  }
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingAuth = () => {
      try {
        const isLoggedIn = AuthService.isLoggedIn();
        if (isLoggedIn) {
          console.log('🔐 User already logged in, redirecting to home');
          // Get returnUrl if available, otherwise go to home
          const returnUrl = searchParams.get('returnUrl') || searchParams.get('next') || '/';
          router.push(returnUrl);
          return;
        }
        setCheckingAuth(false);
      } catch (error) {
        console.error('❌ Error checking existing auth:', error);
        setCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [router, searchParams]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load SDKs when component mounts
  useEffect(() => {
    loadSDKs();
  }, []);

  // Auto-render Google button when SDK is loaded
  useEffect(() => {
    if (sdkLoaded && window.google) {
      console.log('🔄 Auto-rendering Google Sign-In Button...');
      renderGoogleButton();
    }
  }, [sdkLoaded]);

  const loadSDKs = async () => {
    try {
      console.log('🔄 Loading Google and Facebook SDKs...');
      console.log('📋 Configuration:');
      console.log('  - Google Client ID: 62641073672-3rjbtjt32kkng905ebr2nfebq3i18cl3.apps.googleusercontent.com');
      console.log('  - Facebook App ID: your-facebook-app-id');
      
      // Load Google SDK
      if (!window.google) {
        console.log('🔄 Loading Google SDK...');
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            window.googleSDKLoaded = true;
            console.log('✅ Google SDK loaded successfully');
            console.log('🔍 Google SDK object:', window.google);
            resolve(true);
          };
          script.onerror = (error) => {
            console.error('❌ Google SDK load error:', error);
            reject(error);
          };
          document.head.appendChild(script);
          console.log('📤 Google SDK script added to DOM');
        });
      } else {
        console.log('✅ Google SDK already loaded');
      }

      // Load Facebook SDK
      if (!window.FB) {
        console.log('🔄 Loading Facebook SDK...');
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://connect.facebook.net/en_US/sdk.js';
          script.async = true;
          script.defer = true;
          script.crossOrigin = 'anonymous';
          script.onload = () => {
            console.log('🔄 Initializing Facebook SDK...');
            // Initialize Facebook SDK
            (window.FB as any).init({
              appId: 'your-facebook-app-id',
              cookie: true,
              xfbml: true,
              version: 'v18.0'
            });
            window.facebookSDKLoaded = true;
            console.log('✅ Facebook SDK loaded and initialized');
            console.log('🔍 Facebook SDK object:', window.FB);
            resolve(true);
          };
          script.onerror = (error) => {
            console.error('❌ Facebook SDK load error:', error);
            reject(error);
          };
          document.head.appendChild(script);
          console.log('📤 Facebook SDK script added to DOM');
        });
      } else {
        console.log('✅ Facebook SDK already loaded');
      }

      setSdkLoaded(true);
      console.log('✅ All SDKs loaded successfully');
      console.log('🎯 Ready for authentication');
    } catch (error) {
      console.error('❌ Error loading SDKs:', error);
      setError('Không thể tải SDK đăng nhập');
    }
  };

  const renderGoogleButton = () => {
    if (!sdkLoaded || !window.google) {
      console.error('❌ Google SDK not loaded:', { sdkLoaded, google: !!window.google });
      return;
    }

    try {
      console.log('🔄 Rendering Google Sign-In Button...');
      const clientId = '62641073672-3rjbtjt32kkng905ebr2nfebq3i18cl3.apps.googleusercontent.com';
      
      // Initialize Google Identity Services
      (window.google as any).accounts.id.initialize({
        client_id: clientId,
        callback: (response: unknown) => {
          console.log('📧 Google callback triggered');
          console.log('📧 Google response received:', response);
          console.log('📧 Response type:', typeof response);
          console.log('📧 Response keys:', Object.keys(response || {}));
          
          if (response && typeof response === 'object' && response !== null && 'credential' in response) {
            console.log('✅ Valid Google credential received');
            const credential = (response as { credential: string }).credential;
            console.log('🔍 Credential length:', credential.length);
            console.log('🔍 Credential preview:', credential.substring(0, 50) + '...');
            
            // Process the login
            processGoogleLogin(response);
          } else {
            console.error('❌ Invalid Google response:', response);
            setError('Phản hồi từ Google không hợp lệ');
          }
        },
        // Mobile-optimized configuration - use redirect for mobile
        use_fedcm_for_prompt: false,
        auto_select: false,
        cancel_on_tap_outside: true,
        // Use redirect mode for mobile compatibility
        ux_mode: isMobile ? 'redirect' : 'popup',
        redirect_uri: isMobile ? `${window.location.origin}/auth/google/callback` : undefined,
        // Add mobile-specific options
        itp_support: true
      });

      // Render Google Sign-In Button
      const buttonContainer = document.getElementById('google-login-button');
      if (buttonContainer) {
        (window.google as any).accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          width: '100%',
          // Mobile-optimized redirect configuration
          use_fedcm_for_prompt: false,
          // Use redirect mode for mobile compatibility
          ux_mode: isMobile ? 'redirect' : 'popup'
        });
        console.log('✅ Google Sign-In Button rendered');
      } else {
        console.error('❌ Google login button container not found');
        setError('Không thể tạo nút đăng nhập Google');
      }
      
    } catch (error: unknown) {
      console.error('❌ Google button render error:', error);
      
      // Check if it's a popup blocking error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('popup') || errorMessage.includes('blocked')) {
        setError('Trình duyệt đã chặn popup đăng nhập. Vui lòng cho phép popup cho trang này và thử lại.');
      } else {
        setError(errorMessage || 'Không thể tạo nút đăng nhập Google');
      }
    }
  };


  const processGoogleLogin = async (credential: unknown) => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      console.log('📤 Processing Google credential...');
      console.log('📤 Full credential object:', credential);
      
      const credentialData = credential as { credential: string };
      const loginRequest: SocialLoginRequest = {
        provider: 'GOOGLE',
        token: credentialData.credential
      };
      
      console.log('📤 Sending login request to backend:', loginRequest);
      console.log('📤 Request token length:', loginRequest.token.length);
      
      // Call AuthService
      console.log('🔄 Calling AuthService.socialLogin...');
      const response = await AuthService.socialLogin(loginRequest);
      
      console.log('✅ Login successful! Backend response:', response);
      console.log('✅ Response type:', typeof response);
      console.log('✅ Response keys:', Object.keys(response || {}));
      
      setDebugInfo({
        type: 'success',
        data: response,
        timestamp: new Date().toISOString()
      } as any);
      
      // Redirect to intended page or home
      const returnUrl = searchParams.get('returnUrl') || searchParams.get('next') || '/';
      console.log('🔄 Redirecting to:', returnUrl);
      router.push(returnUrl);
      
    } catch (error: any) {
      console.error('❌ Google login processing error:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      setError(error.message || 'Xử lý đăng nhập Google thất bại');
      setDebugInfo({
        type: 'error',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    } finally {
      console.log('🏁 Google login process finished');
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    if (!sdkLoaded || !window.FB) {
      console.error('❌ Facebook SDK not loaded:', { sdkLoaded, FB: !!window.FB });
      setError('Facebook SDK chưa được tải. Vui lòng thử lại.');
      return;
    }

    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      console.log('🔄 Starting Facebook login process...');
      console.log('🔍 Facebook SDK status:', {
        loaded: !!(window.FB as any),
        login: !!(window.FB as any)?.login,
        init: !!(window.FB as any)?.init
      });
      
      const appId = 'your-facebook-app-id';
      console.log('🔑 Using Facebook App ID:', appId);
      
      // Use Facebook SDK
      console.log('🔄 Calling Facebook login...');
      const response = await new Promise((resolve, reject) => {
        (window.FB as any).login((response: any) => {
          console.log('📧 Facebook login callback triggered');
          console.log('📧 Facebook response received:', response);
          console.log('📧 Response type:', typeof response);
          console.log('📧 Response keys:', Object.keys(response || {}));
          console.log('📧 Auth response:', response?.authResponse);
          
          if (response.authResponse) {
            console.log('✅ Valid Facebook auth response received');
            console.log('🔍 Access token length:', response.authResponse.accessToken?.length);
            console.log('🔍 User ID:', response.authResponse.userID);
            console.log('🔍 Expires in:', response.authResponse.expiresIn);
            console.log('🔍 Granted scopes:', response.authResponse.grantedScopes);
            resolve(response);
          } else {
            console.error('❌ Invalid Facebook response:', response);
            console.error('❌ Response status:', response?.status);
            reject(new Error('Facebook login was cancelled or failed'));
          }
        }, {
          scope: 'email,public_profile',
          return_scopes: true
        });
      });

      console.log('📤 Facebook response received successfully');
      console.log('📤 Full response object:', response);
      
      const loginRequest: SocialLoginRequest = {
        provider: 'FACEBOOK',
        token: (response as any).authResponse.accessToken
      };
      
      console.log('📤 Sending login request to backend:', loginRequest);
      console.log('📤 Request token length:', loginRequest.token.length);
      
      // Call AuthService
      console.log('🔄 Calling AuthService.socialLogin...');
      const authResponse = await AuthService.socialLogin(loginRequest);
      
      console.log('✅ Login successful! Backend response:', authResponse);
      console.log('✅ Response type:', typeof authResponse);
      console.log('✅ Response keys:', Object.keys(authResponse || {}));
      
      setDebugInfo({
        type: 'success',
        data: authResponse,
        timestamp: new Date().toISOString()
      });
      
      // Redirect to intended page or home
      const returnUrl = searchParams.get('returnUrl') || searchParams.get('next') || '/';
      console.log('🔄 Redirecting to:', returnUrl);
      router.push(returnUrl);
      
    } catch (error: any) {
      console.error('❌ Facebook login error:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      setError(error.message || 'Đăng nhập Facebook thất bại');
      setDebugInfo({
        type: 'error',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    } finally {
      console.log('🏁 Facebook login process finished');
      setLoading(false);
    }
  };

  // Show loading screen while checking authentication
  if (checkingAuth) {
    return (
      <div className={styles.screen}>
        <div className={styles.brandWrap}>
          <span className={styles.brand}>FoodShare</span>
        </div>
        <div className={styles.loginCard}>
          <div className={styles.loadingSDK}>
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Đang kiểm tra trạng thái đăng nhập...
          </div>
        </div>
        <div className={styles.frame} />
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.brandWrap}>
        <span className={styles.brand}>FoodShare</span>
      </div>

      <div className={styles.loginCard}>
              {/* Error message */}
              {error && (
                <div className={styles.errorAlert} role="alert">
                  <div className="d-flex align-items-center">
                    <span className="me-2">⚠️</span>
                    <span>{error}</span>
                  </div>
                   {error.includes('popup') && (
                     <div className="mt-2 p-2 bg-light rounded">
                       <strong>Hướng dẫn:</strong>
                       <ol className="mb-0 mt-1">
                         <li>Click vào biểu tượng popup bị chặn trên thanh địa chỉ</li>
                         <li>Chọn "Luôn cho phép popup từ trang này"</li>
                         <li>Thử đăng nhập lại</li>
                       </ol>
                     </div>
                   )}
                   {isMobile && (
                     <div className="mt-2 p-2 bg-info bg-opacity-10 rounded">
                       <strong>📱 Hướng dẫn cho điện thoại:</strong>
                       <p className="mb-1">Trên điện thoại, bạn sẽ được chuyển hướng đến trang đăng nhập Google. Sau khi đăng nhập thành công, bạn sẽ được chuyển về ứng dụng.</p>
                     </div>
                   )}
                  {error.includes('click') && (
                    <div className="mt-2 p-2 bg-info bg-opacity-10 rounded">
                      <strong>💡 Gợi ý:</strong>
                      <p className="mb-1">Vui lòng click vào nút <strong>&quot;Đăng nhập với Google&quot;</strong> bên dưới để đăng nhập.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Social Login Buttons */}
              <div className={styles.socialButtons}>
                <h3 className={styles.sectionTitle}>Đăng nhập</h3>
                
                {!sdkLoaded && (
                  <div className={styles.loadingSDK}>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Đang tải SDK đăng nhập...
                  </div>
                )}
                
                {/* Google Sign-In Button Container */}
                <div id="google-login-button" className={styles.googleButtonContainer}>
                  {loading && (
                    <div className={styles.loadingOverlay}>
                      <div className={styles.spinner}></div>
                      <span>Đang đăng nhập...</span>
                    </div>
                  )}
                </div>
                
                
                {/* Facebook Sign-In Button Container - Styled like Google */}
                <div className={styles.facebookButtonContainer}>
                  <button
                    className={styles.facebookCustomButton}
                    onClick={handleFacebookLogin}
                    disabled={loading || !sdkLoaded}
                  >
                    <span className={styles.btnIcon}>
                      {loading ? (
                        <div className={styles.spinner}></div>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24">
                          <path
                            fill="#1877F2"
                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                          />
                        </svg>
                      )}
                    </span>
                    <span className={styles.btnText}>
                      {loading ? "Đang đăng nhập..." : "Đăng nhập với Facebook"}
                    </span>
                  </button>
                  {loading && (
                    <div className={styles.loadingOverlay}>
                      <div className={styles.spinner}></div>
                      <span>Đang đăng nhập...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Skip Button */}
              <div className={styles.skipSection}>
                <Link href="/" className={`${styles.skipBtn} btn btn-outline-light`}>
                  Bỏ qua đăng nhập
                </Link>
              </div>

              {/* Debug Info Panel */}
              {debugInfo && (
                <div className={styles.debugPanel}>
                  <h5>🐛 Debug Information</h5>
                  <div className={styles.debugContent}>
                    <p><strong>Type:</strong> {(debugInfo as any)?.type}</p>
                    <p><strong>Timestamp:</strong> {(debugInfo as any)?.timestamp}</p>
                    {(debugInfo as any)?.type === 'success' && (
                      <div>
                        <p><strong>Response Data:</strong></p>
                        <pre className={styles.debugJson}>
                          {JSON.stringify((debugInfo as any)?.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {(debugInfo as any)?.type === 'error' && (
                      <div>
                        <p><strong>Error:</strong> {(debugInfo as any)?.error}</p>
                        <p><strong>Stack:</strong></p>
                        <pre className={styles.debugJson}>
                          {(debugInfo as any)?.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

      {/* Decorative corner frame (optional) */}
      <div className={styles.frame} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}