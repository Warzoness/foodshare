"use client";

import MobileLoginTest from '@/components/share/MobileLoginTest';

export default function TestMobileLoginPage() {
  return (
    <div>
      <MobileLoginTest 
        onSuccess={() => {
          console.log('Login test successful');
          alert('Login test successful!');
        }}
        onError={(error) => {
          console.error('Login test error:', error);
          alert(`Login test error: ${error}`);
        }}
      />
    </div>
  );
}
