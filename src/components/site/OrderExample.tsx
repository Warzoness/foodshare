"use client";

import { useState } from "react";
import { OrderService } from "@/services/site/order.service";
import { CreateOrderRequest } from "@/types/order";

export default function OrderExample() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleCreateOrder = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const orderData: CreateOrderRequest = {
        shopId: 1,
        productId: 1,
        quantity: 2,
        pickupTime: "2025-09-20T14:30:00",
        unitPrice: 150000,
        totalPrice: 300000
      };

      const response = await OrderService.createOrder(orderData);
      setResult(`Order created successfully! Order ID: ${response.orderId}`);
    } catch (err: any) {
      setError(err.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleGetUserOrders = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const orders = await OrderService.getUserOrders({ page: 0, size: 10 });
      setResult(`Found ${orders.length} orders: ${JSON.stringify(orders, null, 2)}`);
    } catch (err: any) {
      setError(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3>Order Service Example</h3>
      
      <div className="mb-3">
        <button 
          onClick={handleCreateOrder}
          disabled={loading}
          className="btn btn-primary me-2"
        >
          {loading ? "Creating..." : "Create Test Order"}
        </button>
        
        <button 
          onClick={handleGetUserOrders}
          disabled={loading}
          className="btn btn-secondary"
        >
          {loading ? "Loading..." : "Get User Orders"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="alert alert-success">
          <strong>Result:</strong>
          <pre className="mt-2 mb-0" style={{ fontSize: "12px" }}>
            {result}
          </pre>
        </div>
      )}

      <div className="mt-3">
        <h5>Test Order Data:</h5>
        <pre className="bg-light p-2 rounded" style={{ fontSize: "12px" }}>
{`{
  "shopId": 1,
  "productId": 1,
  "quantity": 2,
  "pickupTime": "2025-09-20T14:30:00",
  "unitPrice": 150000,
  "totalPrice": 300000
}`}
        </pre>
      </div>
    </div>
  );
}
