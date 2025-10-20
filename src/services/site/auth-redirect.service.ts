"use client";

import { AuthService } from './auth.service';
import Toast from '@/components/share/Toast';

export interface AuthRedirectOptions {
  showNotification?: boolean;
  redirectDelay?: number;
  customMessage?: string;
}

export class AuthRedirectService {
  private static instance: AuthRedirectService;
  private notificationContainer: HTMLElement | null = null;
  private toastContainer: HTMLElement | null = null;

  static getInstance(): AuthRedirectService {
    if (!AuthRedirectService.instance) {
      AuthRedirectService.instance = new AuthRedirectService();
    }
    return AuthRedirectService.instance;
  }

  /**
   * Handle 401 unauthorized error by redirecting to login
   * @param options - Redirect options
   */
  async handleUnauthorized(options: AuthRedirectOptions = {}): Promise<void> {
    const {
      showNotification = true,
      redirectDelay = 2000,
      customMessage = "Bạn phải đăng nhập để tiếp tục"
    } = options;

    console.log('🔒 Handling unauthorized access (401)');

    // Clear any existing user data
    AuthService.clearUserData();

    if (showNotification) {
      await this.showNotification(customMessage);
    }

    // Redirect to login page after delay
    setTimeout(() => {
      this.redirectToLogin();
    }, redirectDelay);
  }

  /**
   * Show notification to user using React Toast component
   * @param message - Notification message
   */
  private async showNotification(message: string): Promise<void> {
    try {
      // Remove existing notification if any
      this.removeNotification();

      // Create toast container
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'auth-redirect-toast';
      this.toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: flex-start;
        gap: 12px;
        cursor: pointer;
      `;

      // Create icon
      const icon = document.createElement('div');
      icon.style.cssText = `
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        margin-top: 2px;
      `;
      icon.innerHTML = '⚠️';

      // Create message
      const messageEl = document.createElement('div');
      messageEl.style.cssText = `
        flex: 1;
        word-wrap: break-word;
      `;
      messageEl.textContent = message;

      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.style.cssText = `
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 0;
        font-size: 16px;
        line-height: 1;
        margin-left: 8px;
        transition: color 0.2s ease;
      `;
      closeBtn.innerHTML = '×';
      closeBtn.onmouseover = () => closeBtn.style.color = 'white';
      closeBtn.onmouseout = () => closeBtn.style.color = 'rgba(255, 255, 255, 0.8)';
      closeBtn.onclick = () => this.removeNotification();

      // Assemble toast
      this.toastContainer.appendChild(icon);
      this.toastContainer.appendChild(messageEl);
      this.toastContainer.appendChild(closeBtn);

      // Add click handler to close
      this.toastContainer.onclick = () => this.removeNotification();

      // Add to DOM
      document.body.appendChild(this.toastContainer);

      // Animate in
      requestAnimationFrame(() => {
        if (this.toastContainer) {
          this.toastContainer.style.transform = 'translateX(0)';
        }
      });

      console.log('📢 Toast notification shown:', message);
    } catch (error) {
      console.error('❌ Error showing toast notification:', error);
    }
  }

  /**
   * Remove notification from DOM
   */
  private removeNotification(): void {
    if (this.toastContainer) {
      this.toastContainer.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (this.toastContainer && this.toastContainer.parentNode) {
          this.toastContainer.parentNode.removeChild(this.toastContainer);
        }
        this.toastContainer = null;
      }, 300);
    }
    
    // Also clean up old notification container if exists
    if (this.notificationContainer) {
      this.notificationContainer.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (this.notificationContainer && this.notificationContainer.parentNode) {
          this.notificationContainer.parentNode.removeChild(this.notificationContainer);
        }
        this.notificationContainer = null;
      }, 300);
    }
  }

  /**
   * Redirect to login page
   */
  private redirectToLogin(): void {
    try {
      console.log('🔄 Redirecting to login page...');
      
      // Check if we're in a Next.js environment
      if (typeof window !== 'undefined') {
        // Use window.location for reliable redirect
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('❌ Error redirecting to login:', error);
    }
  }

  /**
   * Check if user is authenticated and handle redirect if not
   * @param options - Redirect options
   * @returns Promise<boolean> - true if authenticated, false if redirected
   */
  async checkAuthAndRedirect(options: AuthRedirectOptions = {}): Promise<boolean> {
    const isAuthenticated = AuthService.isLoggedIn();
    
    if (!isAuthenticated) {
      await this.handleUnauthorized(options);
      return false;
    }
    
    return true;
  }
}

// Export singleton instance
export const authRedirectService = AuthRedirectService.getInstance();
