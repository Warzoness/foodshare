'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/services/site/auth.service';
import { UpdateUserRequest, UpdateUserResponse } from '@/types/auth';

interface UpdateUserFormProps {
  onUpdateSuccess?: (user: UpdateUserResponse) => void;
  onUpdateError?: (error: Error) => void;
}

export default function UpdateUserForm({ 
  onUpdateSuccess,
  onUpdateError 
}: UpdateUserFormProps) {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<UpdateUserRequest>({
    name: '',
    email: '',
    phoneNumber: '',
    profilePictureUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load current user data
  useEffect(() => {
    const loadUserData = () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setFormData({
            name: currentUser.name,
            email: currentUser.email,
            phoneNumber: currentUser.phoneNumber || '',
            profilePictureUrl: currentUser.profilePictureUrl || ''
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Không thể tải thông tin người dùng');
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.userId) {
      setError('Không thể lấy thông tin người dùng');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔄 Updating user info:', formData);

      // Ensure userId is a number
      const userId = typeof user.userId === 'string' ? parseInt(user.userId, 10) : user.userId;
      
      if (isNaN(userId)) {
        throw new Error('Invalid user ID');
      }

      const result = await AuthService.updateUserInfo(userId, formData);

      console.log('✅ User updated successfully:', result);
      
      setSuccess('Cập nhật thông tin thành công!');
      
      // Update local user state
      setUser((prev: typeof user) => ({
        ...prev,
        name: result.name,
        email: result.email,
        phoneNumber: result.phoneNumber,
        profilePictureUrl: result.profilePictureUrl
      }));

      if (onUpdateSuccess) {
        onUpdateSuccess(result);
      }

    } catch (error) {
      console.error('❌ Failed to update user:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật thông tin';
      setError(errorMessage);
      
      if (onUpdateError) {
        onUpdateError(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-2">Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  return (
    <div className="update-user-form">
      <h3>Cập nhật thông tin cá nhân</h3>
      
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Tên</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="phoneNumber" className="form-label">Số điện thoại</label>
          <input
            type="tel"
            className="form-control"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            placeholder="1099627282"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="profilePictureUrl" className="form-label">URL ảnh đại diện</label>
          <input
            type="url"
            className="form-control"
            id="profilePictureUrl"
            name="profilePictureUrl"
            value={formData.profilePictureUrl}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
        </button>
      </form>

      {/* Current user info display */}
      <div className="mt-4">
        <h5>Thông tin hiện tại:</h5>
        <div className="card">
          <div className="card-body">
            <p><strong>Tên:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Số điện thoại:</strong> {user.phoneNumber || 'Chưa cập nhật'}</p>
            <p><strong>Ảnh đại diện:</strong> {user.profilePictureUrl || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
