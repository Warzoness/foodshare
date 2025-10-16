"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FloatMenu from "@/components/site/layouts/FloatMenu/FloatMenu";
import AuthGuard from "@/components/share/AuthGuard";
import LoadingSpinner from "@/components/share/LoadingSpinner";
import { AuthService } from "@/services/site/auth.service";
import { OrderService } from "@/services/site/order.service";
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
  const [orderStats, setOrderStats] = useState<{
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string>("");

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

  // Load order statistics
  useEffect(() => {
    const loadOrderStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError("");
        
        const stats = await OrderService.getOrderStats();
        setOrderStats(stats);
      } catch (error) {
        console.error('❌ Error loading order stats:', error);
        setStatsError(error instanceof Error ? error.message : 'Không thể tải thống kê đơn hàng');
      } finally {
        setStatsLoading(false);
      }
    };

    // Only load stats if user is authenticated
    if (user && AuthService.isLoggedIn()) {
      loadOrderStats();
    }
  }, [user]);

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
      // <main className={`container py-3 ${styles.settingsContainer}`} style={{ maxWidth: 560 }}>
      //   <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
      //     <div className="text-center">
      //       <div className="spinner-border" role="status" style={{ color: '#54A65C' }}>
      //         <span className="visually-hidden">Loading...</span>
      //       </div>
      //       <div className="mt-2">Đang kiểm tra đăng nhập...</div>
            <LoadingSpinner message="Đang kiểm tra đăng nhập..." />
          // </div>
        // </div>
      // </main>
    );
  }

  if (!user && !error) {
    return (
      <main className={`container py-3 ${styles.settingsContainer}`} style={{ maxWidth: 560 }}>
        <LoadingSpinner message="Đang tải thông tin..." />
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
      <main className={`container py-4 ${styles.settingsContainer}`}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => history.back()} aria-label="Quay lại">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 19l-7-7 7-7" stroke="#2b2b2b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="h4 mb-0 fw-bold">Cài đặt tài khoản</h1>
          <div></div>
        </header>

        <div className={styles.settingsGrid}>
          {/* Profile Section */}
          <div className={`${styles.settingsCard} ${styles.profileSection}`}>
            <div className={styles.cardTitle}>
              <svg className={styles.cardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Thông tin cá nhân
            </div>

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

              <div className="text-center mt-2 mb-4 fw-semibold h5">{user?.name || 'User'}</div>

              {/* Success Message */}
              {success && (
                <div className="alert alert-success alert-dismissible fade show w-100" role="alert">
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
                <div className="alert alert-danger alert-dismissible fade show w-100" role="alert">
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

              <div className="w-100">
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
                    'Cập nhật thông tin'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Account Stats */}
          <div className={styles.settingsCard}>
            <div className={styles.cardTitle}>
              <svg className={styles.cardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Thống kê tài khoản
            </div>

            {statsLoading ? (
              <div className="d-flex justify-content-center align-items-center py-4">
                <div className="spinner-border spinner-border-sm" role="status" style={{ color: '#54A65C' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span className="ms-2 text-muted">Đang tải thống kê...</span>
              </div>
            ) : statsError ? (
              <div className="alert alert-warning" role="alert">
                <i className="fi fi-rr-exclamation me-2"></i>
                {statsError}
              </div>
            ) : orderStats ? (
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{orderStats.total}</div>
                  <div className={styles.statLabel}>Tổng đơn hàng</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{orderStats.completed}</div>
                  <div className={styles.statLabel}>Đã hoàn thành</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{orderStats.pending}</div>
                  <div className={styles.statLabel}>Đang xử lý</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{orderStats.cancelled}</div>
                  <div className={styles.statLabel}>Đã hủy</div>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <svg className={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div className={styles.emptyStateTitle}>Chưa có đơn hàng</div>
                <div className={styles.emptyStateText}>
                  Bắt đầu đặt hàng để xem thống kê của bạn
                </div>
              </div>
            )}

            <div className={styles.quickActions}>
              <button 
                className={`${styles.actionButton} secondary`}
                onClick={() => router.push('/orders')}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Xem đơn hàng
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className={styles.settingsCard}>
            <div className={styles.cardTitle}>
              <svg className={styles.cardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Tùy chọn
            </div>

            <div className={styles.quickActions}>
              {/* TODO: Món yêu thích - sẽ được sử dụng sau này */}
              {/* <button 
                className={`${styles.actionButton} secondary`}
                onClick={() => router.push('/favorites')}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Món yêu thích
              </button> */}
              <button 
                className={`${styles.actionButton} secondary`}
                onClick={() => router.push('/search')}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Tìm kiếm
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className={styles.settingsCard}>
            <div className={styles.cardTitle}>
              <svg className={styles.cardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hành động tài khoản
            </div>

            <div className={styles.quickActions}>
              <button 
                className={`${styles.actionButton} secondary`}
                onClick={() => router.push('/become-seller')}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Trở thành người bán
              </button>
              <button 
                className={`${styles.actionButton} danger`}
                onClick={handleLogout}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </div>
          </div>

        </div>

        <FloatMenu />
      </main>
    </AuthGuard>
  );
}