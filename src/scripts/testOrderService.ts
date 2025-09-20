import { OrderService } from "@/services/site/order.service";

// Test data matching the provided request
const testOrderData = {
  shopId: 1,
  productId: 1,
  quantity: 2,
  pickupTime: "2025-09-20T14:30:00",
  unitPrice: 150000,
  totalPrice: 300000
};

async function testOrderService() {
  console.log("🧪 Testing Order Service...");
  console.log("📝 Test order data:", testOrderData);

  try {
    // Test creating an order
    console.log("\n1️⃣ Testing createOrder...");
    const createResult = await OrderService.createOrder(testOrderData);
    console.log("✅ Order created successfully:", createResult);

    // If order was created, test getting it
    if (createResult.orderId) {
      console.log("\n2️⃣ Testing getOrder...");
      const order = await OrderService.getOrder(createResult.orderId);
      console.log("✅ Order retrieved successfully:", order);

      // Test getting user orders
      console.log("\n3️⃣ Testing getUserOrders...");
      const userOrders = await OrderService.getUserOrders({ page: 0, size: 10 });
      console.log("✅ User orders retrieved:", userOrders);

      // Test cancelling the order (optional)
      console.log("\n4️⃣ Testing cancelOrder...");
      const cancelledOrder = await OrderService.cancelOrder(createResult.orderId);
      console.log("✅ Order cancelled successfully:", cancelledOrder);
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
    
    // If it's a network error, show more details
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testOrderService()
    .then(() => {
      console.log("\n🏁 Test completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Test failed with unhandled error:", error);
      process.exit(1);
    });
}

export { testOrderService };
