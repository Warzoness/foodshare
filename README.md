This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Thư viện sử dụng : 
 -  Flaticon

 npm install dotenv

 npm install clsx




Cấu trúc dự án : 
my-next-app/
├─ public/                             — Tài nguyên tĩnh (ảnh, fonts, favicon) truy cập trực tiếp qua /...
├─ middleware.ts                       — Bảo vệ /seller (RBAC, JWT) chạy trước mọi request khớp matcher
├─ next.config.mjs                     — Cấu hình Next.js (headers, rewrites, images, experimental)
├─ tsconfig.json                       — Path alias "@/..." và thiết lập TypeScript
├─ .env.local                          — Biến môi trường (API URL, JWT keys)
└─ src/
   ├─ app/                             — App Router: định nghĩa routes, layouts, API handlers
   │  ├─ (site)/                       — Nhóm route Public (không đổi URL)
   │  │  ├─ layout.tsx                 — Layout chung cho Site (header/nav/footer)
   │  │  └─ page.tsx                   — Trang chủ "/" (mặc định vào Site)
   │  │
   │  │  ├─ about/
   │  │  │  └─ page.tsx                — "/about"
   │  │  ├─ items/
   │  │  │  ├─ page.tsx                — "/items" (list)
   │  │  │  └─ [id]/page.tsx           — "/items/:id" (detail)
   │  │  └─ (marketing)/               — Nhóm route phụ cho Site (grouping, không đổi URL)
   │  │     └─ pricing/page.tsx        — "/pricing"
   │  │
   │  ├─ (seller)/                      — Nhóm route seller (layout riêng)
   │  │  ├─ seller/                     — Thư mục thật để URL là "/seller"
   │  │  │  ├─ layout.tsx              — Layout seller (sidebar/header, grid)
   │  │  │  ├─ page.tsx                — "/seller" (dashboard)
   │  │  │  ├─ items/
   │  │  │  │  ├─ page.tsx             — "/seller/items" (CRUD list)
   │  │  │  │  ├─ new/page.tsx         — "/seller/items/new" (create)
   │  │  │  │  └─ [id]/page.tsx        — "/seller/items/:id" (edit/detail)
   │  │  │  ├─ users/page.tsx          — "/seller/users" (quản lý người dùng)
   │  │  │  └─ settings/page.tsx       — "/seller/settings" (cấu hình nội bộ)
   │  │  └─ auth/
   │  │     ├─ login/page.tsx          — "/auth/login" (form đăng nhập, set cookie HttpOnly)
   │  │     └─ logout/page.tsx         — "/auth/logout" (xoá cookie, chuyển hướng)
   │  │
   │  ├─ api/                          — Route Handlers (server-only APIs)
   │  │  ├─ auth/
   │  │  │  └─ login/route.ts          — POST "/api/auth/login" (proxy backend, set cookie)
   │  │  ├─ items/route.ts             — GET/POST "/api/items" (server actions, proxy)
   │  │  └─ items/[id]/route.ts        — GET/PATCH/DELETE "/api/items/:id"
   │  │
   │  ├─ (error)/error.tsx             — Error boundary dùng chung cho App Router
   │  └─ not-found.tsx                 — Trang 404 cho toàn bộ app
   │
   ├─ components/                      — Thư viện UI tái sử dụng
   │  ├─ shared/                       — Button/Input/Dialog/Toast (dùng cho Site & seller)
   │  ├─ site/                         — Component riêng cho Site (hero, feature, card)
   │  └─ seller/                        — Component riêng cho seller (table, form, modal)
   │
   ├─ styles/                          — Styling toàn cục & module
   │  ├─ globals.css                   — Global CSS (theme, reset, variables)
   │  └─ components/                   — *.module.css cho từng component/page
   │
   ├─ lib/                             — Tiện ích dùng chung (server/client)
   │  ├─ fetcher.ts                    — apiFetch(), API_BASE, wrapper fetch
   │  ├─ auth.ts                       — getCurrentUser(), đọc cookie, decode token (server helpers)
   │  ├─ rbac.ts                       — Rule phân quyền (can.viewseller, can.manageUsers,…)
   │  └─ utils.ts                      — Helpers (formatDate, slugify, paginate,…)
   │
   ├─ services/                        — Tầng gọi backend (business-facing)
   │  ├─ itemsService.ts               — list/create/update/delete Items (dùng fetcher)
   │  └─ userService.ts                — auth profile, users CRUD (seller)
   │
   ├─ types/                           — Kiểu TypeScript chia sẻ giữa client/server
   │  ├─ auth.ts                       — User, Session, JWTPayload
   │  └─ item.ts                       — Item, ItemDTO, query params
   │
   └─ seller/                           — Logic bảo mật riêng phần seller
      └─ auth/
         └─ verifyJWT.ts              — Xác thực JWT (jose), dùng bởi middleware/route 
		 
		 
		 
		 
		 
	

