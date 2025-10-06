"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FloatMenu from "@/components/site/layouts/FloatMenu/FloatMenu";
import AuthGuard from "@/components/share/AuthGuard";
import { AuthService } from "@/services/site/auth.service";
import { User, UpdateUserRequest } from "@/types/auth";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Debug: Check authentication status
        const isLoggedIn = AuthService.isLoggedIn();
        console.log('🔐 AuthService.isLoggedIn():', isLoggedIn);
        
        if (!isLoggedIn) {
          console.log('❌ User not authenticated');
          setError('Vui lòng đăng nhập để xem thông tin tài khoản');
          setLoading(false);
          return;
        }

        const currentUser = AuthService.getCurrentUser();
        console.log('👤 AuthService.getCurrentUser():', currentUser);
        
        // Debug localStorage data
        console.log('🔍 localStorage debug:', {
          'current_user_email': localStorage.getItem('current_user_email'),
          'user': localStorage.getItem('user'),
          'user_parsed': localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
        });
        
        if (!currentUser) {
          console.log('❌ No user data found in localStorage');
          setLoading(false);
          return;
        }

        // Call API to get fresh user data
        console.log('🔄 Fetching fresh user data from API for userId:', currentUser.userId);
        
        // Ensure userId is a number
        const userId = typeof currentUser.userId === 'string' ? parseInt(currentUser.userId, 10) : currentUser.userId;
        
        if (isNaN(userId)) {
          throw new Error('Invalid user ID');
        }
        
        const freshUserData = await AuthService.getUserInfo(userId);
        console.log('✅ Fresh user data from API:', freshUserData);
        
        // Validate fresh user data
        if (!freshUserData.userId) {
          console.error('❌ API returned invalid user data:', freshUserData);
          throw new Error('API returned invalid user data');
        }
        
        // Update state with fresh data from API
        setUser({
          userId: freshUserData.userId,
          name: freshUserData.name,
          email: freshUserData.email,
          phoneNumber: freshUserData.phoneNumber,
          provider: currentUser.provider, // Keep provider info from localStorage
          providerId: currentUser.providerId, // Keep provider info from localStorage
          profilePictureUrl: freshUserData.profilePictureUrl
        });
        
        setName(freshUserData.name || '');
        setEmail(freshUserData.email || '');
        setPhone(freshUserData.phoneNumber || '');
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Load user data error:', error);
        
        // Check if it's an authentication error
        const errorMessage = (error as Error).message.toLowerCase();
        if (errorMessage.includes('authentication failed') || 
            errorMessage.includes('authentication token') || 
            errorMessage.includes('unauthorized') ||
            errorMessage.includes('please log in again') ||
            errorMessage.includes('authentication failed. please log in again.')) {
          console.log('🔒 Authentication error detected, clearing user data');
          AuthService.clearUserData();
          // AuthGuard will handle showing login screen
        } else {
          // Fallback to localStorage data if API fails
          const currentUser = AuthService.getCurrentUser();
          if (currentUser && currentUser.userId) {
            console.log('🔄 Falling back to localStorage data');
            setUser(currentUser);
            setName(currentUser.name || '');
            setEmail(currentUser.email || '');
            setPhone(currentUser.phoneNumber || '');
          } else {
            console.error('❌ No valid user data found in localStorage either');
            setError('Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.');
          }
        }
        
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user) {
      console.error('❌ No user data available for form submission');
      setError("Không tìm thấy thông tin người dùng. Vui lòng tải lại trang.");
      return;
    }
    
    if (!user.userId) {
      console.error('❌ User data missing userId:', user);
      
      // Try to reload user data as fallback
      try {
        console.log('🔄 Attempting to reload user data...');
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.userId) {
          console.log('✅ Found user data in localStorage, updating state');
          setUser(currentUser);
          setName(currentUser.name || '');
          setEmail(currentUser.email || '');
          setPhone(currentUser.phoneNumber || '');
          return; // Retry the form submission
        }
      } catch (error) {
        console.error('❌ Failed to reload user data:', error);
      }
      
      setError("Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const updateData: UpdateUserRequest = {
        name: name.trim(),
        email: email.trim(), // Allow user to edit email
        phoneNumber: phone.trim(),
        profilePictureUrl: user.profilePictureUrl || undefined
      };

      console.log('🔄 Updating user profile:', updateData);
      
      // Debug user data
      console.log('🔍 User data debug:', {
        user: user,
        userId: user.userId,
        userIdType: typeof user.userId,
        userIdValue: user.userId
      });
      
      // Ensure userId is a number
      const userId = typeof user.userId === 'string' ? parseInt(user.userId, 10) : user.userId;
      
      console.log('🔍 Parsed userId:', userId, 'isNaN:', isNaN(userId));
      
      if (isNaN(userId)) {
        console.error('❌ Invalid user ID:', user.userId, 'Type:', typeof user.userId);
        throw new Error(`Invalid user ID: ${user.userId} (type: ${typeof user.userId})`);
      }
      
      const updatedUserResponse = await AuthService.updateUserInfo(userId, updateData);
      
      console.log('✅ Profile updated successfully:', updatedUserResponse);
      
      // Convert UpdateUserResponse to User format for local state
      const updatedUser: User = {
        userId: updatedUserResponse.id,
        name: updatedUserResponse.name,
        email: updatedUserResponse.email,
        phoneNumber: updatedUserResponse.phoneNumber,
        provider: user.provider, // Keep existing provider info
        providerId: user.providerId, // Keep existing provider info
        profilePictureUrl: updatedUserResponse.profilePictureUrl
      };
      
      // Update local state
      setUser(updatedUser);
      setSuccess("Cập nhật thông tin thành công!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      
      // Check if it's an authentication error
      const errorMessage = (err as Error).message.toLowerCase();
      if (errorMessage.includes('authentication failed') || 
          errorMessage.includes('authentication token') || 
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('please log in again') ||
          errorMessage.includes('authentication failed. please log in again.')) {
        console.log('🔒 Authentication error detected during profile update');
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật thông tin");
      }
    } finally {
      setUpdating(false);
    }
  }

  function handleLogout() {
    AuthService.clearUserData();
    router.push('/');
  }

  if (loading) {
    return (
      <main className={`container py-3 ${styles.settingsContainer}`} style={{ maxWidth: 560 }}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border" role="status" style={{ color: '#54A65C' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2">Đang kiểm tra đăng nhập...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!user && !error) {
    return (
      <main className={`container py-3 ${styles.settingsContainer}`} style={{ maxWidth: 560 }}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border" role="status" style={{ color: '#54A65C' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2">Đang tải thông tin...</div>
          </div>
        </div>
      </main>
    );
  }

  // Hiển thị thông báo lỗi authentication
  if (error && !user) {
    return (
      <main className={`container py-3 ${styles.settingsContainer}`} style={{ maxWidth: 560 }}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => history.back()} aria-label="Quay lại">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 19l-7-7 7-7" stroke="#2b2b2b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </header>

        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="mb-3">
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#FEF2F2', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto',
                marginBottom: '16px'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                </svg>
              </div>
            </div>
            <h5 className="fw-bold mb-2" style={{ color: '#1F2937' }}>Vui lòng đăng nhập</h5>
            <p className="text-muted mb-4" style={{ fontSize: '14px', lineHeight: '1.5' }}>
              {error}
            </p>
            <button 
              className="btn px-4 py-2" 
              style={{ 
                backgroundColor: '#54A65C', 
                borderColor: '#54A65C', 
                color: 'white', 
                borderRadius: '8px', 
                fontSize: '14px', 
                fontWeight: '500' 
              }}
              onClick={() => {
                AuthService.clearUserData();
                window.location.href = '/auth/login';
              }}
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>

        <FloatMenu />
      </main>
    );
  }

  return (
    <AuthGuard>
      <main className={`container py-3 ${styles.settingsContainer}`} style={{ maxWidth: 560 }}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => history.back()} aria-label="Quay lại">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" stroke="#2b2b2b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      <form onSubmit={onSubmit} className="d-flex flex-column align-items-center">
        <div className={styles.avatar} aria-hidden>
          {(() => {
            console.log('🖼️ Rendering avatar - profilePictureUrl:', user?.profilePictureUrl);
            console.log('🖼️ Profile picture type:', typeof user?.profilePictureUrl);
            console.log('🖼️ Profile picture truthy:', !!user?.profilePictureUrl);
            
            if (user?.profilePictureUrl) {
              return (
                <Image 
                  src={user.profilePictureUrl} 
                  alt={user.name || 'User'}
                  width={120}
                  height={120}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    console.error('❌ Image failed to load:', user?.profilePictureUrl);
                    console.error('❌ Error event:', e);
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', user?.profilePictureUrl);
                  }}
                />
              );
            } else {
              console.log('🖼️ Using default SVG avatar');
              return (
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="36" r="22" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <path d="M20 98c8-18 28-28 40-28s32 10 40 28" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                  <circle cx="86" cy="64" r="10" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                </svg>
              );
            }
          })()}
        </div>

        <div className="text-center mt-1 mb-3 fw-semibold">{user?.name || 'User'}</div>

        <div className="w-100" style={{ maxWidth: 520 }}>
          {/* Success Message */}
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="fi fi-rr-check me-2"></i>
              {success}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccess("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="fi fi-rr-exclamation me-2"></i>
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          <label className="form-label">Tên</label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên"
            disabled={updating}
            required
          />

          <label className="form-label mt-3">Email</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email"
            disabled={updating}
            required
          />

          <label className="form-label mt-3">Số điện thoại</label>
          <input
            className={styles.input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            placeholder="Nhập số điện thoại"
            disabled={updating}
            required
          />

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={updating}
          >
            {updating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ color: '#54A65C' }}></span>
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật'
            )}
          </button>
          
          <button 
            type="button" 
            className="btn btn-outline-danger mt-3 w-100"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      </form>

      <FloatMenu />
    </main>
    </AuthGuard>
  );
}