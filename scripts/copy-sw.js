const { copyFileSync, existsSync } = require("fs");
const { join } = require("path");

const scriptsPath = join(__dirname, "firebase-messaging-sw.js");
const publicPath = join(__dirname, "..", "public", "firebase-messaging-sw.js");

if (existsSync(scriptsPath)) {
  try {
    copyFileSync(scriptsPath, publicPath);
    console.log("✅ Đã copy firebase-messaging-sw.js từ scripts vào public");
  } catch (error) {
    console.error("❌ Lỗi khi copy firebase-messaging-sw.js:", error);
    process.exit(1);
  }
} else {
  console.warn("⚠️ Không tìm thấy file firebase-messaging-sw.js trong scripts");
}

