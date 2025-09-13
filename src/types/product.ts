// src/mocks/products.ts
export type MockProduct = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  distanceKm?: number;
  discountPercent?: number; // ví dụ 20 => giảm 20%
};

// 16 sản phẩm mẫu để đủ 3 section hiển thị
export const MOCK_PRODUCTS: MockProduct[] = [
  { id: 1,  name: "Gà rán giòn",      price: 309000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 1.2,discountPercent: 20 },
  { id: 2,  name: "Cánh gà sốt",      price: 42000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 3.6 },
  { id: 3,  name: "Đùi gà BBQ",       price: 49000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 2.3 },
  { id: 4,  name: "Gà rán cay",       price: 45000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 4.8 },
  { id: 5,  name: "Combo 2 miếng",    price: 59000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 5.1 },
  { id: 6,  name: "Burger gà",        price: 29000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 0.8 },
  { id: 7,  name: "Cánh gà mật ong",  price: 39000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 1.9 },
  { id: 8,  name: "Gà popcorn",       price: 25000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 6.0 },
  { id: 9,  name: "Gà rán góc phố",   price: 35000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 0.6 },
  { id: 10, name: "Gà không bột",     price: 44000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 2.8 },
  { id: 11, name: "Đùi gà tỏi",       price: 47000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 3.1 },
  { id: 12, name: "Cánh gà phô mai",  price: 52000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 1.1 },
  { id: 13, name: "Salad gà",         price: 33000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 2.0 },
  { id: 14, name: "Gà sốt Teriyaki",  price: 46000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 4.0 },
  { id: 15, name: "Cơm gà xối mỡ",    price: 38000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 0.9 },
  { id: 16, name: "Mì Ý gà bằm",      price: 36000, imageUrl: "/images/chicken-fried.jpg", distanceKm: 3.7 },
];
