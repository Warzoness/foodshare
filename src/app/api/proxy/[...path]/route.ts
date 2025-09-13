import { NextRequest, NextResponse } from "next/server";

const urls = (process.env.API_BASE_URLS ?? "https://foodshare-production-aa3c.up.railway.app")
  .split(",")
  .map(s => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const TIMEOUT = Number(process.env.API_PROXY_TIMEOUT ?? "8000");
const MAX_RETRIES = Number(process.env.API_PROXY_MAX_RETRIES ?? "1");

// module-scope pointer (round-robin đơn giản)
let ptr = 0;
function nextHost() {
  if (!urls.length) throw new Error("Missing API_BASE_URLS");
  const host = urls[ptr % urls.length];
  ptr = (ptr + 1) % urls.length;
  return host;
}

async function forward(req: NextRequest, host: string, pathSegs: string[]) {
  const { search } = new URL(req.url);
  const target = `${host}/${pathSegs.join("/")}${search}`;

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), TIMEOUT);

  // copy body cho non-GET
  let body: BodyInit | undefined = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) body = await req.text();
    else if (ct.includes("application/x-www-form-urlencoded")) body = await req.text();
    else if (ct.includes("multipart/form-data")) body = await req.blob();
    else body = await req.arrayBuffer();
  }

  // lọc 1 số header không nên forward
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");

  try {
    const res = await fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(to);

    // giữ content-type/length, v.v…
    const outHeaders = new Headers();
    res.headers.forEach((v, k) => outHeaders.set(k, v));

    // Trả thẳng body, cùng status
    return new NextResponse(res.body, {
      status: res.status,
      headers: outHeaders,
    });
  } catch (e) {
    clearTimeout(to);
    throw e;
  }
}

// export handler cho mọi method
async function handler(req: NextRequest, ctx: { params: { path: string[] } }) {
  const path = ctx.params.path || [];
  let lastErr: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const host = nextHost();
    try {
      return await forward(req, host, path);
    } catch (e) {
      lastErr = e;
    }
  }
  return NextResponse.json(
    { success: false, error: (lastErr as Error)?.message ?? "Proxy failed" },
    { status: 502 },
  );
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS };
