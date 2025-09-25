"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./Login.module.css";
import Link from "next/link";
import { AuthService } from "@/services/site/auth.service";
import { SocialLoginRequest } from "@/types/auth";

// Declare global types for SDKs
declare global {
  interface Window {
    google: any;
    FB: any;
    googleSDKLoaded: boolean;
    facebookSDKLoaded: boolean;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Load SDKs when component mounts
  useEffect(() => {
    loadSDKs();
  }, []);

  // Auto-render Google button when SDK is loaded
  useEffect(() => {
    if (sdkLoaded && window.google) {
      console.log('🔄 Auto-rendering Google Sign-In Button...');
      handleGoogleLogin();
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
            window.FB.init({
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

  const handleGoogleLogin = async () => {
    if (!sdkLoaded || !window.google) {
      console.error('❌ Google SDK not loaded:', { sdkLoaded, google: !!window.google });
      setError('Google SDK chưa được tải. Vui lòng thử lại.');
      return;
    }

    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      console.log('🔄 Starting Google login process...');
      console.log('🔍 Google SDK status:', {
        loaded: !!window.google,
        accounts: !!window.google?.accounts,
        id: !!window.google?.accounts?.id
      });
      
      const clientId = '62641073672-3rjbtjt32kkng905ebr2nfebq3i18cl3.apps.googleusercontent.com';
      console.log('🔑 Using Client ID:', clientId);
      
      // Initialize Google Identity Services
      console.log('🔄 Initializing Google Identity Services...');
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          console.log('📧 Google callback triggered');
          console.log('📧 Google response received:', response);
          console.log('📧 Response type:', typeof response);
          console.log('📧 Response keys:', Object.keys(response || {}));
          
          if (response && response.credential) {
            console.log('✅ Valid Google credential received');
            console.log('🔍 Credential length:', response.credential.length);
            console.log('🔍 Credential preview:', response.credential.substring(0, 50) + '...');
            
            // Process the login
            processGoogleLogin(response);
          } else {
            console.error('❌ Invalid Google response:', response);
            setError('Phản hồi từ Google không hợp lệ');
            setLoading(false);
          }
        }
      });

      // Render Google Sign-In Button
      console.log('🔄 Rendering Google Sign-In Button...');
      const buttonContainer = document.getElementById('google-login-button');
      if (buttonContainer) {
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          width: '100%'
        });
        console.log('✅ Google Sign-In Button rendered');
      } else {
        console.error('❌ Google login button container not found');
        setError('Không thể tạo nút đăng nhập Google');
        setLoading(false);
      }
      
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      setError(error.message || 'Đăng nhập Google thất bại');
      setLoading(false);
    }
  };

  const processGoogleLogin = async (credential: any) => {
    try {
      console.log('📤 Processing Google credential...');
      console.log('📤 Full credential object:', credential);
      
      const loginRequest: SocialLoginRequest = {
        provider: 'GOOGLE',
        token: credential.credential
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
      });
      
      // Redirect to intended page or home
      const nextUrl = searchParams.get('next') || '/';
      console.log('🔄 Redirecting to:', nextUrl);
      router.push(nextUrl);
      
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
        loaded: !!window.FB,
        login: !!window.FB?.login,
        init: !!window.FB?.init
      });
      
      const appId = 'your-facebook-app-id';
      console.log('🔑 Using Facebook App ID:', appId);
      
      // Use Facebook SDK
      console.log('🔄 Calling Facebook login...');
      const response = await new Promise((resolve, reject) => {
        window.FB.login((response: any) => {
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
      const nextUrl = searchParams.get('next') || '/';
      console.log('🔄 Redirecting to:', nextUrl);
      router.push(nextUrl);
      
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
                <div id="google-login-button" className={styles.googleButtonContainer}></div>
                
                {/* Fallback Google Button */}
                <button
                  className={`${styles.socialButton} ${styles.googleButton}`}
                  onClick={handleGoogleLogin}
                  disabled={loading || !sdkLoaded}
                  style={{ display: 'none' }} // Hide fallback button
                >
                  <span className={styles.btnIcon}>
                    {loading ? (
                      <div className={styles.spinner}></div>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                  </span>
                  <span className={styles.btnText}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập với Google"}
                  </span>
                </button>

                <button
                  className={`${styles.socialButton} ${styles.facebookButton}`}
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
                    <p><strong>Type:</strong> {debugInfo.type}</p>
                    <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
                    {debugInfo.type === 'success' && (
                      <div>
                        <p><strong>Response Data:</strong></p>
                        <pre className={styles.debugJson}>
                          {JSON.stringify(debugInfo.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {debugInfo.type === 'error' && (
                      <div>
                        <p><strong>Error:</strong> {debugInfo.error}</p>
                        <p><strong>Stack:</strong></p>
                        <pre className={styles.debugJson}>
                          {debugInfo.stack}
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