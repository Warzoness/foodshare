import { apiClient } from "@/lib/apiClient";
import { SocialLoginRequest, SocialLoginResponse, AuthApiResponse, UpdateUserRequest, User, SocialProvider } from "@/types/auth";

const AUTH_ENDPOINT = "/auth";

// Check if running on client side
const isClient = typeof window !== 'undefined';

export const AuthService = {
  /**
   * Social login with provider token
   * @param request - Social login request data
   * @returns Promise<SocialLoginResponse>
   */
  async socialLogin(request: SocialLoginRequest): Promise<SocialLoginResponse> {
    try {
      console.log('🔄 AuthService: Starting social login process');
      console.log('📋 Request details:', {
        provider: request.provider,
        tokenLength: request.token?.length,
        tokenPreview: request.token?.substring(0, 50) + '...',
        existingUserId: request.existingUserId,
        linkEmail: request.linkEmail
      });
      
      // Step 1: Extract user info from social token (email, name, picture)
      console.log('🔄 Step 1: Extracting user info from social token...');
      const userInfo = await this.getUserInfoFromSocialToken(request.provider, request.token);
      console.log('📧 Extracted user info from social token:', userInfo);
      console.log('📧 User info details:', {
        email: userInfo.email,
        name: userInfo.name,
        hasProfilePicture: !!userInfo.profilePictureUrl,
        profilePictureUrl: userInfo.profilePictureUrl
      });
      
      // Step 2: Check if user already exists in localStorage by email
      console.log('🔄 Step 2: Checking existing user in localStorage...');
      const existingUserData = this.findExistingUserByEmail(userInfo.email);
      console.log('👤 Existing user check result:', {
        found: !!existingUserData,
        userId: existingUserData?.userId,
        name: existingUserData?.name,
        email: existingUserData?.email
      });
      
      let response: AuthApiResponse<SocialLoginResponse>;
      
      if (existingUserData) {
        console.log('👤 User already exists in localStorage, reusing data');
        console.log('📤 Sending request to backend with existing user ID:', existingUserData.userId);
        
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
        console.log('📤 Sending request to backend for new user creation');
        
        // New user, create account with server
        response = await apiClient.post<AuthApiResponse<SocialLoginResponse>>(`${AUTH_ENDPOINT}/social`, {
          headers: {
            'Content-Type': 'application/json'
          },
          body: request
        });
      }

      console.log('📥 Backend response received:', response);
      console.log('📥 Response success:', response.success);
      console.log('📥 Response message:', response.message);
      console.log('📥 Response data keys:', Object.keys(response.data || {}));

      if (!response.success) {
        console.error('❌ Backend returned error:', response.message);
        throw new Error(response.message || 'Social login failed');
      }

      console.log('✅ Social login successful from backend');
      console.log('✅ Backend response data:', response.data);
      
      // Step 3: Store user data with email as key for persistence
      console.log('🔄 Step 3: Storing user data in localStorage...');
      this.storeUserDataByEmail(response.data, userInfo.email);
      console.log('✅ User data stored successfully');
      
      return response.data;
    } catch (error) {
      console.error('❌ Social login error in AuthService:', error);
      console.error('❌ Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
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
    console.log('🔄 getUserInfoFromSocialToken: Starting token processing');
    console.log('📋 Token details:', {
      provider,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + '...',
      tokenType: typeof token
    });

    if (provider === "GOOGLE") {
      console.log('🔄 Processing Google JWT token...');
      // Decode Google JWT token to get user info
      try {
        // Check if token is a valid JWT format (has 3 parts separated by dots)
        const parts = token.split('.');
        console.log('🔍 JWT token parts count:', parts.length);
        console.log('🔍 JWT token parts preview:', {
          header: parts[0]?.substring(0, 20) + '...',
          payload: parts[1]?.substring(0, 20) + '...',
          signature: parts[2]?.substring(0, 20) + '...'
        });

        if (parts.length !== 3) {
          throw new Error('Invalid JWT token format');
        }
        
        console.log('🔄 Decoding JWT payload...');
        const payload = JSON.parse(atob(parts[1]));
        console.log('🔍 Decoded Google JWT payload:', payload);
        console.log('🔍 Payload details:', {
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          aud: payload.aud,
          iss: payload.iss,
          exp: payload.exp,
          iat: payload.iat
        });
        
        // Validate required fields
        if (!payload.email || !payload.name) {
          console.error('❌ Missing required fields in JWT payload:', {
            hasEmail: !!payload.email,
            hasName: !!payload.name,
            email: payload.email,
            name: payload.name
          });
          throw new Error('Missing required user information in token');
        }
        
        const userInfo = {
          email: payload.email,
          name: payload.name,
          profilePictureUrl: payload.picture
        };
        
        console.log('✅ Google token decoded successfully:', userInfo);
        return userInfo;
      } catch (error) {
        console.error('❌ Error decoding Google token:', error);
        console.error('❌ Error details:', {
          message: (error as Error).message,
          stack: (error as Error).stack,
          tokenPreview: token.substring(0, 100) + '...'
        });
        throw new Error('Invalid Google token: ' + (error as Error).message);
      }
    } else if (provider === "FACEBOOK") {
      console.log('🔄 Processing Facebook access token...');
      // Call Facebook Graph API to get user info
      try {
        console.log('🔄 Calling Facebook Graph API...');
        const apiUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`;
        console.log('📤 Facebook API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('📥 Facebook API response status:', response.status);
        console.log('📥 Facebook API response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('📧 Facebook Graph API response:', data);
        console.log('📧 Response details:', {
          hasError: !!data.error,
          hasId: !!data.id,
          hasName: !!data.name,
          hasEmail: !!data.email,
          hasPicture: !!data.picture
        });
        
        if (data.error) {
          console.error('❌ Facebook API returned error:', data.error);
          throw new Error(data.error.message);
        }
        
        // Validate required fields
        if (!data.email || !data.name) {
          console.error('❌ Missing required fields from Facebook:', {
            hasEmail: !!data.email,
            hasName: !!data.name,
            email: data.email,
            name: data.name
          });
          throw new Error('Missing required user information from Facebook');
        }
        
        const userInfo = {
          email: data.email,
          name: data.name,
          profilePictureUrl: data.picture?.data?.url
        };
        
        console.log('✅ Facebook token processed successfully:', userInfo);
        return userInfo;
      } catch (error) {
        console.error('❌ Error getting Facebook user info:', error);
        console.error('❌ Error details:', {
          message: (error as Error).message,
          stack: (error as Error).stack,
          tokenPreview: token.substring(0, 20) + '...'
        });
        throw new Error('Facebook API error: ' + (error as Error).message);
      }
    }
    
    console.error('❌ Unsupported provider:', provider);
    throw new Error('Unsupported provider: ' + provider);
  },

  /**
   * Find existing user by email in localStorage
   * @param email - User email
   * @returns Existing user data or null
   */
  findExistingUserByEmail(email: string): SocialLoginResponse | null {
    try {
      if (!isClient) return null;
      
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
      if (!isClient) return;
      
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
      if (!isClient) return;
      
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
      if (!isClient) return null;
      
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
      if (!isClient) return null;
      
      // First try to get current user's token
      const currentUserEmail = localStorage.getItem('current_user_email');
      if (currentUserEmail) {
        const tokenKey = `token_${currentUserEmail}`;
        const token = localStorage.getItem(tokenKey);
        if (token) {
          return token;
        }
      }
      
      // Fallback to old method
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
      if (!isClient) return;
      
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
      if (!isClient) return;
      
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
      if (!isClient) return [];
      
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
      if (!isClient) return;
      
      const accounts = this.getLinkedAccounts();
      const filtered = accounts.filter(acc => acc.email !== email);
      localStorage.setItem('linked_accounts', JSON.stringify(filtered));
      console.log('✅ Linked account removed:', email);
    } catch (error) {
      console.error('❌ Error removing linked account:', error);
    }
  },

  /**
   * Logout user - clear all stored data
   */
  logout(): void {
    this.clearUserData();
  }
};
