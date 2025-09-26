"use client";

import { useState } from 'react';
import { OrderService } from '@/services/site/order.service';
import { AuthService } from '@/services/site/auth.service';

export default function TestOrderPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testOrderData = {
    userId: 1,
    shopId: 1,
    productId: 1,
    quantity: 2,
    pickupTime: "2025-09-26T06:06:19.071Z",
    unitPrice: 50000,
    totalPrice: 100000
  };

  const testOrderCreation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing Order Creation API...');
      console.log('📋 Test data:', testOrderData);
      
      // Check authentication first
      console.log('🔍 Checking authentication...');
      const token = AuthService.getStoredToken();
      const userData = AuthService.getStoredUserData();
      
      console.log('Auth state:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        hasUserData: !!userData,
        userEmail: userData?.email,
        userId: userData?.userId
      });
      
      if (!token) {
        throw new Error('No authentication token found. Please log in first.');
      }
      
      // Test the API call
      console.log('📤 Making POST request to /orders...');
      const response = await OrderService.createOrder(testOrderData);
      
      console.log('📥 API Response:', response);
      setResult(response);
      
    } catch (err) {
      console.error('❌ Error testing order creation:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testGetOrders = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing Get Orders API...');
      const orders = await OrderService.getUserOrders({ page: 0, size: 10 });
      console.log('📥 Orders Response:', orders);
      setResult(orders);
    } catch (err) {
      console.error('❌ Error testing get orders:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 800 }}>
      <h1>🧪 Order API Test</h1>
      
      <div className="mb-4">
        <h3>Authentication Status</h3>
        <div className="card p-3">
          <p><strong>Token:</strong> {AuthService.getStoredToken() ? '✅ Found' : '❌ Not found'}</p>
          <p><strong>User Data:</strong> {AuthService.getStoredUserData() ? '✅ Found' : '❌ Not found'}</p>
          <p><strong>Logged In:</strong> {AuthService.isLoggedIn() ? '✅ Yes' : '❌ No'}</p>
        </div>
      </div>

      <div className="mb-4">
        <h3>Test Data</h3>
        <pre className="bg-light p-3 rounded">
          {JSON.stringify(testOrderData, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <button 
          className="btn btn-primary me-2" 
          onClick={testOrderCreation}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Create Order'}
        </button>
        
        <button 
          className="btn btn-secondary" 
          onClick={testGetOrders}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Get Orders'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <h5>❌ Error</h5>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="alert alert-success">
          <h5>✅ Result</h5>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
