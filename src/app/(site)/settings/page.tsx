"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    const loadUserData = () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
          console.log('🔒 No user data found, redirecting to login');
          router.push('/auth/login');
          return;
        }

        console.log('✅ User authenticated:', currentUser);
        setUser(currentUser);
        setName(currentUser.name || '');
        setEmail(currentUser.email || '');
        setPhone(currentUser.phoneNumber || ''); // Use phoneNumber from user data
        setLoading(false);
      } catch (error) {
        console.error('❌ Load user data error:', error);
        router.push('/auth/login');
      }
    };

    loadUserData();
  }, [router]);

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
      
      const updatedUser = await AuthService.updateUserInfo(user.userId, updateData);
      
      console.log('✅ Profile updated successfully:', updatedUser);
      
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
    return null; // Will redirect
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
        <button className={styles.iconBtn} aria-label="Cài đặt">
          <span className="fi fi-rr-settings"></span>
        </button>
      </header>

      <form onSubmit={onSubmit} className="d-flex flex-column align-items-center">
        <div className={styles.avatar} aria-hidden>
          {user.profilePictureUrl ? (
            <img 
              src={user.profilePictureUrl} 
              alt={user.name}
              width="120"
              height="120"
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="36" r="22" fill="none" stroke="#cbd5e1" strokeWidth="3" />
              <path d="M20 98c8-18 28-28 40-28s32 10 40 28" fill="none" stroke="#cbd5e1" strokeWidth="3" />
              <circle cx="86" cy="64" r="10" fill="none" stroke="#cbd5e1" strokeWidth="3" />
            </svg>
          )}
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