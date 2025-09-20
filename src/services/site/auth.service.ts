import { apiClient } from "@/lib/apiClient";
import { SocialLoginRequest, SocialLoginResponse, AuthApiResponse, UpdateUserRequest, User, SocialProvider } from "@/types/auth";

const AUTH_ENDPOINT = "/auth";

export const AuthService = {
  /**
   * Social login with provider token
   * @param request - Social login request data
   * @returns Promise<SocialLoginResponse>
   */
  async socialLogin(request: SocialLoginRequest): Promise<SocialLoginResponse> {
    try {
      console.log('🔄 Attempting social login with provider:', request.provider);
      
      // Step 1: Extract user info from social token (email, name, picture)
      const userInfo = await this.getUserInfoFromSocialToken(request.provider, request.token);
      console.log('📧 Extracted user info from social token:', userInfo);
      
      // Step 2: Check if user already exists in localStorage by email
      const existingUserData = this.findExistingUserByEmail(userInfo.email);
      
      let response: AuthApiResponse<SocialLoginResponse>;
      
      if (existingUserData) {
        console.log('👤 User already exists in localStorage, reusing data:', existingUserData);
        // User exists locally, reuse their data but get fresh token from server
        response = await apiClient.post<AuthApiResponse<SocialLoginResponse>>(`${AUTH_ENDPOINT}/social`, {
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            ...request,
            existingUserId: existingUserData.userId
          }
        });
      } else {
        console.log('🆕 New user, creating account with server');
        // New user, create account with server
        response = await apiClient.post<AuthApiResponse<SocialLoginResponse>>(`${AUTH_ENDPOINT}/social`, {
          headers: {
            'Content-Type': 'application/json'
          },
          body: request
        });
      }

      if (!response.success) {
        throw new Error(response.message || 'Social login failed');
      }

      console.log('✅ Social login successful:', response.data);
      
      // Step 3: Store user data with email as key for persistence
      this.storeUserDataByEmail(response.data, userInfo.email);
      
      return response.data;
    } catch (error) {
      console.error('❌ Social login error:', error);
      throw error;
    }
  },

  /**
   * Extract user info from social provider token
   * @param provider - Social provider
   * @param token - Social provider token
   * @returns User info with email
   */
  async getUserInfoFromSocialToken(provider: "GOOGLE" | "FACEBOOK" | "APPLE", token: string): Promise<{ email: string; name: string; profilePictureUrl?: string }> {
    if (provider === "GOOGLE") {
      // Decode Google JWT token to get user info
      try {
        // Check if token is a valid JWT format (has 3 parts separated by dots)
        const parts = token.split('.');
        if (parts.length !== 3) {
          // Mock token fallback - use consistent email for testing
          return {
            email: 'testuser@gmail.com', // Consistent email for testing
            name: 'Test User',
            profilePictureUrl: undefined
          };
        }
        
        const payload = JSON.parse(atob(parts[1]));
        console.log('🔍 Decoded JWT payload:', payload);
        
        return {
          email: payload.email,
          name: payload.name,
          profilePictureUrl: payload.picture
        };
      } catch (error) {
        console.error('❌ Error decoding Google token:', error);
        // Mock token fallback - use consistent email for testing
        return {
          email: 'testuser@gmail.com', // Consistent email for testing
          name: 'Test User',
          profilePictureUrl: undefined
        };
      }
    } else if (provider === "FACEBOOK") {
      // Call Facebook Graph API to get user info
      try {
        const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`);
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message);
        }
        
        return {
          email: data.email,
          name: data.name,
          profilePictureUrl: data.picture?.data?.url
        };
      } catch (error) {
        console.error('❌ Error getting Facebook user info:', error);
        // Mock token fallback - use consistent email for testing
        return {
          email: 'testuser@facebook.com', // Consistent email for testing
          name: 'Test User',
          profilePictureUrl: undefined
        };
      }
    }
    
    throw new Error('Unsupported provider');
  },

  /**
   * Find existing user by email in localStorage
   * @param email - User email
   * @returns Existing user data or null
   */
  findExistingUserByEmail(email: string): SocialLoginResponse | null {
    try {
      console.log('🔍 Looking for existing user in localStorage with email:', email);
      
      const userKey = `user_${email}`;
      const userData = localStorage.getItem(userKey);
      
      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log('✅ Found existing user data:', parsedData);
        return parsedData;
      }
      
      console.log('❌ No existing user found for email:', email);
      return null;
    } catch (error) {
      console.error('❌ Error finding existing user by email:', error);
      return null;
    }
  },

  /**
   * Store user data with email as key for persistence
   * @param userData - User data from social login
   * @param email - User email as key
   */
  storeUserDataByEmail(userData: SocialLoginResponse, email: string): void {
    try {
      // Store with email as key for persistence
      const userKey = `user_${email}`;
      const tokenKey = `token_${email}`;
      
      localStorage.setItem(userKey, JSON.stringify(userData));
      localStorage.setItem(tokenKey, userData.token);
      
      // Also store as current user for easy access
      localStorage.setItem('current_user_email', email);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      
      // Store linked account info
      this.storeLinkedAccount(email, userData);
      
      console.log('💾 User data stored with email key:', email);
    } catch (error) {
      console.error('❌ Error storing user data by email:', error);
    }
  },

  /**
   * Store user data in localStorage
   * @param userData - User data from social login
   */
  storeUserData(userData: SocialLoginResponse): void {
    try {
      // Store user data with email as key for persistence
      const userKey = `user_${userData.email}`;
      const tokenKey = `token_${userData.email}`;
      
      localStorage.setItem(userKey, JSON.stringify(userData));
      localStorage.setItem(tokenKey, userData.token);
      
      // Also store current user for easy access
      localStorage.setItem('current_user_email', userData.email);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      
      console.log('💾 User data stored in localStorage with email key:', userData.email);
    } catch (error) {
      console.error('❌ Error storing user data:', error);
    }
  },

  /**
   * Get stored user data from localStorage
   * @returns User data or null
   */
  getStoredUserData(): SocialLoginResponse | null {
    try {
      // First try to get current user
      const currentUserEmail = localStorage.getItem('current_user_email');
      if (currentUserEmail) {
        const userKey = `user_${currentUserEmail}`;
        const userData = localStorage.getItem(userKey);
        if (userData) {
          return JSON.parse(userData);
        }
      }
      
      // Fallback to old method
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error getting stored user data:', error);
      return null;
    }
  },

  /**
   * Get stored token from localStorage
   * @returns Token or null
   */
  getStoredToken(): string | null {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('❌ Error getting stored token:', error);
      return null;
    }
  },

  /**
   * Clear stored user data and token
   */
  clearUserData(): void {
    try {
      // Clear current user data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('current_user_email');
      
      // Clear all user data stored by email
      const currentUserEmail = localStorage.getItem('current_user_email');
      if (currentUserEmail) {
        localStorage.removeItem(`user_${currentUserEmail}`);
        localStorage.removeItem(`token_${currentUserEmail}`);
      }
      
      console.log('🗑️ User data cleared from localStorage');
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
    }
  },

  /**
   * Check if user is logged in
   * @returns boolean
   */
  isLoggedIn(): boolean {
    const token = this.getStoredToken();
    const userData = this.getStoredUserData();
    return !!(token && userData);
  },

  /**
   * Get user information by ID
   * @param userId - User ID
   * @returns Promise<User>
   */
  async getUserInfo(userId: number): Promise<User> {
    try {
      console.log('🔄 Fetching user info for ID:', userId);
      
      const token = this.getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.get<AuthApiResponse<User>>(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user info');
      }

      console.log('✅ User info fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user info:', error);
      throw error;
    }
  },

  /**
   * Get current user info from stored data
   * @returns User data or null
   */
  getCurrentUser(): User | null {
    const userData = this.getStoredUserData();
    if (!userData) return null;
    
    return {
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      phoneNumber: (userData as any).phoneNumber || undefined,
      provider: userData.provider,
      providerId: userData.providerId,
      profilePictureUrl: userData.profilePictureUrl
    };
  },

  /**
   * Update user information
   * @param userId - User ID
   * @param updateData - User update data
   * @returns Promise<User>
   */
  async updateUserInfo(userId: number, updateData: UpdateUserRequest): Promise<User> {
    try {
      console.log('🔄 Updating user info for ID:', userId, 'with data:', updateData);
      
      const token = this.getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.put<AuthApiResponse<User>>(`/api/users/${userId}`, {
        body: updateData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update user info');
      }

      console.log('✅ User info updated successfully:', response.data);
      
      // Update stored user data with new info
      const currentUserData = this.getStoredUserData();
      if (currentUserData) {
        const updatedUserData = {
          ...currentUserData,
          name: response.data.name,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          profilePictureUrl: response.data.profilePictureUrl
        };
        this.storeUserData(updatedUserData);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error updating user info:', error);
      throw error;
    }
  },

  /**
   * Store linked account information
   * @param email - Internal email
   * @param userData - User data with provider info
   */
  storeLinkedAccount(email: string, userData: SocialLoginResponse): void {
    try {
      const linkedAccounts = this.getLinkedAccounts();
      const accountInfo = {
        email,
        name: userData.name,
        provider: userData.provider,
        providerId: userData.providerId,
        profilePictureUrl: userData.profilePictureUrl,
        linkedAt: new Date().toISOString()
      };
      
      // Update or add account
      const existingIndex = linkedAccounts.findIndex(acc => acc.email === email);
      if (existingIndex >= 0) {
        linkedAccounts[existingIndex] = accountInfo;
      } else {
        linkedAccounts.push(accountInfo);
      }
      
      localStorage.setItem('linked_accounts', JSON.stringify(linkedAccounts));
      console.log('✅ Linked account stored:', accountInfo);
    } catch (error) {
      console.error('❌ Error storing linked account:', error);
    }
  },

  /**
   * Get all linked accounts
   * @returns Array of linked account info
   */
  getLinkedAccounts(): Array<{
    email: string;
    name: string;
    provider: SocialProvider;
    providerId: string;
    profilePictureUrl: string;
    linkedAt: string;
  }> {
    try {
      const stored = localStorage.getItem('linked_accounts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error getting linked accounts:', error);
      return [];
    }
  },

  /**
   * Get linked account by email
   * @param email - Email to search for
   * @returns Linked account info or null
   */
  getLinkedAccountByEmail(email: string): {
    email: string;
    name: string;
    provider: SocialProvider;
    providerId: string;
    profilePictureUrl: string;
    linkedAt: string;
  } | null {
    const accounts = this.getLinkedAccounts();
    return accounts.find(acc => acc.email === email) || null;
  },

  /**
   * Remove linked account
   * @param email - Email to remove
   */
  removeLinkedAccount(email: string): void {
    try {
      const accounts = this.getLinkedAccounts();
      const filtered = accounts.filter(acc => acc.email !== email);
      localStorage.setItem('linked_accounts', JSON.stringify(filtered));
      console.log('✅ Linked account removed:', email);
    } catch (error) {
      console.error('❌ Error removing linked account:', error);
    }
  }
};
