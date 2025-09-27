import { ProductService } from "@/services/site/product.service";

async function testSearchAPI() {
  console.log("🔍 Testing Search API...");
  
  try {
    // Test 1: Basic search without location
    console.log("\n1. Testing basic search...");
    const basicSearch = await ProductService.search({
      q: "bánh mì",
      page: 0,
      size: 5
    });
    console.log("✅ Basic search result:", basicSearch);

    // Test 2: Search with location
    console.log("\n2. Testing search with location...");
    const locationSearch = await ProductService.search({
      q: "phở",
      page: 0,
      size: 5,
      latitude: 10.7769,
      longitude: 106.7009
    });
    console.log("✅ Location search result:", locationSearch);

    // Test 3: Empty search (should return all products)
    console.log("\n3. Testing empty search...");
    const emptySearch = await ProductService.search({
      page: 0,
      size: 5
    });
    console.log("✅ Empty search result:", emptySearch);

  } catch (error) {
    console.error("❌ Search API test failed:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

// Run the test
testSearchAPI().then(() => {
  console.log("\n🏁 Search API test completed");
}).catch(console.error);
