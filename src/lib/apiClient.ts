// Client gọi thẳng Spring backend (không dùng env)
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions = {
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;            // object sẽ tự JSON.stringify
  timeoutMs?: number;    // mặc định 8000
  retries?: number;      // mặc định 1 (thử lại 1 lần)
  skipAuthRedirect?: boolean; // mặc định false - có tự động redirect khi 401 không
};

const BASE_URL = "https://foodshare-production-98da.up.railway.app"; // <-- hardcode

export class ApiClient {
  constructor(
    private baseUrl: string = BASE_URL,
    private defaultTimeout = 8000,
    private defaultRetries = 1
  ) {}

  private buildUrl(path: string, query?: Record<string, any>) {
    const cleanBase = this.baseUrl.replace(/\/+$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const u = new URL(cleanBase + cleanPath);

    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          u.searchParams.set(k, String(v));
        }
      });
    }
    return u.toString();
  }

  private async doFetch(method: HttpMethod, path: string, opt: RequestOptions = {}) {
    const url = this.buildUrl(path, opt.query);
    const timeoutMs = opt.timeoutMs ?? this.defaultTimeout;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(opt.headers || {}),
    };
    let body: BodyInit | undefined;

    if (opt.body !== undefined && opt.body !== null) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      body = headers["Content-Type"].includes("application/json")
        ? JSON.stringify(opt.body)
        : (opt.body as any);
    }

    // Log gọn cho dev
    console.log(`[API][REQ] ${method} ${url}`);

    try {
      const res = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
        // Nếu dùng cookie/JWT qua cookie:
        // credentials: "include",
      });

      clearTimeout(timer);

      // parse JSON nếu có
      const ctype = res.headers.get("content-type") || "";
      const data = ctype.includes("application/json") ? await res.json().catch(() => null) : null;

      console.log(`[API][RES] ${method} ${url}`, res.status);

      if (!res.ok) {
        // Handle 401 Unauthorized - redirect to login
        if (res.status === 401 && !opt.skipAuthRedirect) {
          console.log('🔒 401 Unauthorized detected, triggering auth redirect...');
          
          // Import auth redirect service dynamically to avoid circular dependencies
          const { authRedirectService } = await import('@/services/site/auth-redirect.service');
          await authRedirectService.handleUnauthorized({
            showNotification: true,
            redirectDelay: 2000,
            customMessage: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục."
          });
        }

        // Try to extract error message from response body
        let errorMessage = `HTTP ${res.status}`;
        
        if (data) {
          // Check various possible error message fields
          errorMessage = data.message || data.error || data.errorMessage || data.detail || errorMessage;
          
          // If it's a structured error response, try to get more details
          if (data.errors && Array.isArray(data.errors)) {
            errorMessage = data.errors.join(', ');
          }
        }
        
        console.error(`[API][ERR] ${method} ${url}`, {
          status: res.status,
          statusText: res.statusText,
          errorMessage,
          responseData: data
        });
        
        throw new Error(errorMessage);
      }

      // nếu là JSON, trả JSON; nếu không, trả Response gốc
      return data ?? (res as any);
    } catch (err) {
      console.error(`[API][ERR] ${method} ${url}`, err);
      throw err;
    }
  }

  private async withRetry(method: HttpMethod, path: string, opt: RequestOptions = {}) {
    const retries = opt.retries ?? this.defaultRetries;
    let lastErr: unknown;

    for (let i = 0; i <= retries; i++) {
      try {
        return await this.doFetch(method, path, opt);
      } catch (e) {
        lastErr = e;
        if (i === retries) break;
      }
    }
    throw lastErr;
  }

  get<T = unknown>(path: string, opt?: RequestOptions) {
    return this.withRetry("GET", path, opt) as Promise<T>;
  }
  post<T = unknown>(path: string, opt?: RequestOptions) {
    return this.withRetry("POST", path, opt) as Promise<T>;
  }
  put<T = unknown>(path: string, opt?: RequestOptions) {
    return this.withRetry("PUT", path, opt) as Promise<T>;
  }
  patch<T = unknown>(path: string, opt?: RequestOptions) {
    return this.withRetry("PATCH", path, opt) as Promise<T>;
  }
  delete<T = unknown>(path: string, opt?: RequestOptions) {
    return this.withRetry("DELETE", path, opt) as Promise<T>;
  }
}

export const apiClient = new ApiClient();
