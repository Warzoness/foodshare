// src/admin/auth/verifyJWT.ts
import { jwtVerify, JWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * Verify JWT access token
 * @param token JWT string từ cookie hoặc header
 * @returns payload nếu hợp lệ
 * @throws Error nếu token không hợp lệ / hết hạn
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"], // hoặc RS256 nếu bạn dùng public/private key
    });
    return payload;
  } catch (err) {
    console.error("verifyJWT error:", err);
    throw new Error("Invalid or expired token");
  }
}
