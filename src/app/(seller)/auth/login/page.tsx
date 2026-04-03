"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./Login.module.css";
import Link from "next/link";
import LoadingSpinner from "@/components/share/LoadingSpinner";
import { AuthService } from "@/services/site/auth.service";
import { SocialLoginRequest } from "@/types/auth";

// Declare global types for SDKs
declare global {
  interface Window {
    google: unknown;
    googleSDKLoaded: boolean;
  }
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before doing anything
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    if (!mounted) return;
    
    const checkExistingAuth = () => {
      try {
        const isLoggedIn = AuthService.isLoggedIn();
        if (isLoggedIn) {
          console.log('🔐 User already logged in, redirecting to home');
          // Get returnUrl if available, otherwise go to home
          const returnUrl = searchParams.get('returnUrl') || searchParams.get('next') || '/home';
          router.replace(returnUrl);
          return;
        }
        setCheckingAuth(false);
      } catch (error) {
        console.error('❌ Error checking existing auth:', error);
        setCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [router, searchParams, mounted]);

  // Detect mobile device
  useEffect(() => {
    if (!mounted) return;
    
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mounted]);

  // Load SDKs when component mounts
  useEffect(() => {
    if (!mounted) return;
    loadSDKs();
  }, [mounted]);

  const loadSDKs = async () => {
    try {
      console.log('🔄 Loading Google SDK...');
      console.log('📋 Configuration:');
      console.log('  - Google Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '62641073672-3rjbtjt32kkng905ebr2nfebq3i18cl3.apps.googleusercontent.com');
      
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


      setSdkLoaded(true);
      console.log('✅ All SDKs loaded successfully');
      console.log('🎯 Ready for authentication');
    } catch (error) {
      console.error('❌ Error loading SDKs:', error);
      setError('Không thể tải SDK đăng nhập');
    }
  };

  const renderGoogleButton = useCallback(() => {
    if (!sdkLoaded || !window.google || checkingAuth) {
      console.error('❌ Google SDK not loaded or component is redirecting:', { 
        sdkLoaded, 
        google: !!window.google, 
        checkingAuth 
      });
      return;
    }

    try {
      console.log('🔄 Rendering Google Sign-In Button...');
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '62641073672-3rjbtjt32kkng905ebr2nfebq3i18cl3.apps.googleusercontent.com';
      
      // Initialize Google Identity Services with mobile-optimized settings
      const googleConfig: any = {
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
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true
      };

      // Configure for mobile vs desktop
      if (isMobile) {
        console.log('📱 Mobile device detected - using popup with fallback');
        // On mobile, still use popup but with better error handling
        googleConfig.ux_mode = 'popup';
        googleConfig.use_fedcm_for_prompt = false;
      } else {
        console.log('🖥️ Desktop device detected - using popup flow');
        googleConfig.ux_mode = 'popup';
        googleConfig.use_fedcm_for_prompt = false;
      }

      (window.google as any).accounts.id.initialize(googleConfig);

      // Render Google Sign-In Button with mobile-optimized settings
      const buttonContainer = document.getElementById('google-login-button');
      if (buttonContainer && !checkingAuth) {
        const buttonConfig: any = {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'circle',
          text: 'signin_with',
          width: '250px',
          height: '50px'
        };

        // Configure button for mobile vs desktop
        if (isMobile) {
          console.log('📱 Rendering mobile-optimized Google button');
          buttonConfig.ux_mode = 'redirect';
          buttonConfig.use_fedcm_for_prompt = false;
        } else {
          console.log('🖥️ Rendering desktop Google button');
          buttonConfig.ux_mode = 'popup';
          buttonConfig.use_fedcm_for_prompt = false;
        }

        (window.google as any).accounts.id.renderButton(buttonContainer, buttonConfig);
        console.log('✅ Google Sign-In Button rendered');
      } else {
        console.error('❌ Google login button container not found or component is redirecting');
        if (!checkingAuth) {
          setError('Không thể tạo nút đăng nhập Google');
        }
      }
      
    } catch (error: unknown) {
      console.error('❌ Google button render error:', error);
      
      // Check if it's a popup blocking error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('popup') || errorMessage.includes('blocked')) {
        if (isMobile) {
          setError('Trên điện thoại, vui lòng cho phép popup hoặc thử đăng nhập bằng trình duyệt khác.');
        } else {
          setError('Trình duyệt đã chặn popup đăng nhập. Vui lòng cho phép popup cho trang này và thử lại.');
        }
      } else if (errorMessage.includes('invalid') || errorMessage.includes('Yêu cầu không hợp lệ')) {
        setError('Cấu hình Google OAuth không đúng. Vui lòng liên hệ quản trị viên.');
      } else {
        setError(errorMessage || 'Không thể tạo nút đăng nhập Google');
      }
    }
  }, [sdkLoaded, checkingAuth, isMobile]);

  // Auto-render Google button when SDK is loaded
  useEffect(() => {
    if (sdkLoaded && window.google && !checkingAuth) {
      console.log('🔄 Auto-rendering Google Sign-In Button...');
      renderGoogleButton();
    }
  }, [sdkLoaded, checkingAuth, renderGoogleButton]);


  const processGoogleLogin = useCallback(async (credential: unknown) => {
    setLoading(true);
    setError(null);
    
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
      
      // Redirect to intended page or home
      const returnUrl = searchParams.get('returnUrl') || searchParams.get('next') || '/home';
      console.log('🔄 Redirecting to:', returnUrl);
      router.replace(returnUrl);
      
    } catch (error: any) {
      console.error('❌ Google login processing error:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // Provide user-friendly error messages
      let userMessage = 'Xử lý đăng nhập Google thất bại';
      
      if (error.message.includes('Invalid Google token')) {
        userMessage = 'Token Google không hợp lệ. Vui lòng thử lại.';
      } else if (error.message.includes('Failed to decode JWT')) {
        userMessage = 'Lỗi xử lý thông tin từ Google. Vui lòng thử lại.';
      } else if (error.message.includes('expired')) {
        userMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.message.includes('popup')) {
        userMessage = 'Popup đăng nhập bị chặn. Vui lòng cho phép popup hoặc thử trình duyệt khác.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        userMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      }
      
      setError(userMessage);
    } finally {
      console.log('🏁 Google login process finished');
      setLoading(false);
    }
  }, [searchParams, router]);


  // Show loading screen while checking authentication
  if (checkingAuth) {
    return (
      <div className={styles.screen}>
        <div className={styles.brandWrap}>
          <span className={styles.brand}>FoodShare</span>
        </div>
        <div className={styles.loginCard}>
          <LoadingSpinner 
            message="Đang kiểm tra trạng thái đăng nhập..." 
            size="small"
            className={styles.loadingSDK}
          />
        </div>
        <div className={styles.frame} />
      </div>
    );
  }

  return (
    <div className={styles.screen} suppressHydrationWarning={true}>
      <div className={styles.brandWrap}>
        <span className={styles.brand}>FoodShare</span><br/>
        <span className={styles.description}>Chia đồ ăn, gắn kết cộng đồng</span>
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
                       <p className="mb-1">Nếu popup bị chặn, hãy thử:</p>
                       <ol className="mb-1">
                         <li>Cho phép popup cho trang này</li>
                         <li>Thử trình duyệt khác (Chrome, Safari)</li>
                         <li>Đăng nhập trên máy tính trước</li>
                       </ol>
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
                    <LoadingSpinner 
                      size="small" 
                      message="Đang tải SDK đăng nhập..." 
                      showMessage={true}
                    />
                  </div>
                )}
                
                {/* Google Sign-In Button Container */}
                <div id="google-login-button" className={styles.googleButtonContainer}>
                  {/*{loading && (*/}
                  {/*  <div className={styles.loadingOverlay}>*/}
                  {/*    <LoadingSpinner*/}
                  {/*      size="small"*/}
                  {/*      variant="white"*/}
                  {/*      message="Đang đăng nhập..."*/}
                  {/*      showMessage={true}*/}
                  {/*    />*/}
                  {/*  </div>*/}
                  {/*)}*/}
                </div>
              </div>

              {/* Skip Button */}
              <div className={styles.skipSection}>
                <Link href="/home" className={`${styles.skipBtn} btn btn-outline-light`}>
                  Bỏ qua đăng nhập
                </Link>
              </div>

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