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
          setLoading(false);
          return;
        }

        const currentUser = AuthService.getCurrentUser();
        console.log('👤 AuthService.getCurrentUser():', currentUser);
        
        if (!currentUser) {
          console.log('❌ No user data found in localStorage');
          setLoading(false);
          return;
        }

        // Call API to get fresh user data
        console.log('🔄 Fetching fresh user data from API for userId:', currentUser.userId);
        const freshUserData = await AuthService.getUserInfo(currentUser.userId);
        console.log('✅ Fresh user data from API:', freshUserData);
        
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
        
        // Fallback to localStorage data if API fails
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          console.log('🔄 Falling back to localStorage data');
          setUser(currentUser);
          setName(currentUser.name || '');
          setEmail(currentUser.email || '');
          setPhone(currentUser.phoneNumber || '');
        }
        
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user) {
      setError("Không tìm thấy thông tin người dùng");
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
      
      const updatedUserResponse = await AuthService.updateUserInfo(user.userId, updateData);
      
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
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật thông tin");
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
      <main className="container py-3" style={{ maxWidth: 560 }}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2">Đang kiểm tra đăng nhập...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container py-3" style={{ maxWidth: 560 }}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2">Đang tải thông tin...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AuthGuard>
      <main className="container py-3" style={{ maxWidth: 560 }}>
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
            console.log('🖼️ Rendering avatar - profilePictureUrl:', user.profilePictureUrl);
            console.log('🖼️ Profile picture type:', typeof user.profilePictureUrl);
            console.log('🖼️ Profile picture truthy:', !!user.profilePictureUrl);
            
            if (user.profilePictureUrl) {
              return (
                <Image 
                  src={user.profilePictureUrl} 
                  alt={user.name}
                  width={120}
                  height={120}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    console.error('❌ Image failed to load:', user.profilePictureUrl);
                    console.error('❌ Error event:', e);
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', user.profilePictureUrl);
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

        <div className="text-center mt-1 mb-3 fw-semibold">{user.name}</div>

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
            className="form-control border-success"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên"
            disabled={updating}
            required
          />

          <label className="form-label mt-3">Email</label>
          <input
            className="form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email"
            disabled={updating}
            required
          />

          <label className="form-label mt-3">Số điện thoại</label>
          <input
            className="form-control"
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
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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