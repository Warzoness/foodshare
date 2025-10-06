'use client';

import { useState } from 'react';
import { OrderService } from '@/services/site/order.service';
import { CreateOrderRequest, CreateOrderResponse } from '@/types/order';

interface OrderPlacementExampleProps {
  productId: number;
  shopId: number;
  unitPrice: number;
  onOrderSuccess?: (order: CreateOrderResponse) => void;
  onOrderError?: (error: Error) => void;
}

export default function OrderPlacementExample({ 
  productId, 
  shopId, 
  unitPrice, 
  onOrderSuccess,
  onOrderError 
}: OrderPlacementExampleProps) {
  const [quantity, setQuantity] = useState(1);
  const [pickupTime, setPickupTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = unitPrice * quantity;

  const handlePlaceOrder = async () => {
    if (!pickupTime) {
      setError('Please select a pickup time');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current user ID from auth context
      const userId = 1; // TODO: Get from auth context

      const orderData: CreateOrderRequest = {
        userId,
        shopId,
        productId,
        quantity,
        pickupTime,
        unitPrice,
        totalPrice
      };

      console.log('🛒 Placing order:', orderData);

      const result = await OrderService.createOrder(orderData);

      console.log('✅ Order placed successfully:', result);
      
      if (onOrderSuccess) {
        onOrderSuccess(result);
      }

      // Reset form
      setQuantity(1);
      setPickupTime('');
      
    } catch (error) {
      console.error('❌ Failed to place order:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      setError(errorMessage);
      
      if (onOrderError) {
        onOrderError(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generate pickup time options (next 7 days, every 30 minutes)
  const generatePickupTimes = () => {
    const times = [];
    const now = new Date();
    
    for (let day = 1; day <= 7; day++) {
      const date = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
      const dayStr = date.toISOString().split('T')[0];
      
      for (let hour = 9; hour <= 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeStr = `${dayStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00.000Z`;
          times.push({
            value: timeStr,
            label: `${dayStr} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          });
        }
      }
    }
    
    return times;
  };

  const pickupTimeOptions = generatePickupTimes();

  return (
    <div className="order-placement-form">
      <h3>Place Your Order</h3>
      
      <div className="form-group">
        <label htmlFor="quantity">Quantity:</label>
        <input
          id="quantity"
          type="number"
          min="1"
          max="10"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="pickupTime">Pickup Time:</label>
        <select
          id="pickupTime"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          disabled={isLoading}
        >
          <option value="">Select pickup time</option>
          {pickupTimeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="order-summary">
        <p><strong>Unit Price:</strong> ${unitPrice.toFixed(2)}</p>
        <p><strong>Quantity:</strong> {quantity}</p>
        <p><strong>Total Price:</strong> ${totalPrice.toFixed(2)}</p>
      </div>

      {error && (
        <div className="error-message">
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={isLoading || !pickupTime}
        className="place-order-btn"
      >
        {isLoading ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
}
