"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from './GoogleLoginButton';

interface MobileLoginTestProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function MobileLoginTest({ onSuccess, onError }: MobileLoginTestProps) {
  const router = useRouter();
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  // Detect device information
  const detectDevice = () => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    const isTouchDevice = 'ontouchstart' in window;
    
    const info = {
      userAgent,
      isMobile,
      isSmallScreen,
      isTouchDevice,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      platform: navigator.platform,
      vendor: navigator.vendor
    };
    
    setDeviceInfo(info);
    return info;
  };

  const handleTestLogin = () => {
    const device = detectDevice();
    console.log('🔍 Device detection:', device);
    
    if (device.isMobile || device.isSmallScreen) {
      console.log('📱 Mobile device detected - redirecting to login page');
      router.push('/auth/login');
    } else {
      console.log('🖥️ Desktop device detected - using popup flow');
      // This will trigger the GoogleLoginButton's popup flow
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">🔧 Mobile Login Test</h4>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h5>Device Information:</h5>
                {deviceInfo ? (
                  <div className="bg-light p-3 rounded">
                    <pre className="mb-0" style={{ fontSize: '12px' }}>
                      {JSON.stringify(deviceInfo, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={detectDevice}
                  >
                    Detect Device
                  </button>
                )}
              </div>

              <div className="mb-4">
                <h5>Login Options:</h5>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={handleTestLogin}
                  >
                    Test Login Flow
                  </button>
                  
                  <GoogleLoginButton 
                    onSuccess={() => {
                      console.log('✅ Google login successful');
                      onSuccess?.();
                    }}
                    onError={(error) => {
                      console.error('❌ Google login error:', error);
                      onError?.(error);
                    }}
                  />
                </div>
              </div>

              <div className="alert alert-info">
                <h6>📱 Mobile vs Desktop Behavior:</h6>
                <ul className="mb-0">
                  <li><strong>Mobile:</strong> Uses redirect flow to <code>/auth/login</code></li>
                  <li><strong>Desktop:</strong> Uses popup flow with Google Identity Services</li>
                  <li><strong>Fallback:</strong> If popup fails, redirects to login page</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
