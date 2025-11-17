// Auth types for FoodShare app

export type SocialProvider = "GOOGLE" | "APPLE";

export type SocialLoginRequest = {
  provider: SocialProvider;
  token: string;
  existingUserId?: number; // Optional: for existing users
  linkEmail?: string; // Email nội bộ để link với tài khoản social
};

export type SocialLoginResponse = {
  token: string;
  userId: number;
  name: string;
  email: string;
  provider: SocialProvider;
  providerId: string;
  profilePictureUrl: string;
};

export type AuthApiResponse<T> = {
  code: string;
  success: boolean;
  data: T;
  message: string;
};

export type User = {
  userId: number;
  name: string;
  email: string;
  phoneNumber?: string;
  provider: SocialProvider;
  providerId: string;
  profilePictureUrl: string;
};

export type UpdateUserResponse = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string;
};

export type UpdateUserRequest = {
  name: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl?: string;
};
