const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

// Avoid circular import: access the store imperatively at call-time
function getAuthState() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuthStore } = require("@/store/auth.store");
  return useAuthStore.getState() as {
    token: string | null;
    refreshToken: string | null;
    setTokens: (access: string, refresh: string) => void;
    logout: () => void;
  };
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function doRefresh(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = getAuthState();
  if (!refreshToken) {
    logout();
    return null;
  }

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    logout();
    return null;
  }

  const json = await res.json();
  const newAccess: string = json.data.accessToken;
  const newRefresh: string = json.data.refreshToken;
  setTokens(newAccess, newRefresh);
  return newAccess;
}

async function refreshOnce(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => refreshQueue.push(resolve));
  }
  isRefreshing = true;
  try {
    const token = await doRefresh();
    refreshQueue.forEach((cb) => cb(token));
    return token;
  } finally {
    isRefreshing = false;
    refreshQueue = [];
  }
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: string[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function execute<T>(path: string, options: RequestInit, retry = true): Promise<T> {
  const { token } = getAuthState();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const json = await res.json().catch(() => null);

  if (res.status === 401 && retry) {
    const newToken = await refreshOnce();
    if (newToken) return execute<T>(path, options, false);
    throw new ApiError(401, "Sesión expirada. Por favor iniciá sesión nuevamente.");
  }

  if (!res.ok) {
    const msg = Array.isArray(json?.message)
      ? json.message.join(", ")
      : json?.message ?? `HTTP ${res.status}`;
    throw new ApiError(res.status, msg);
  }

  return (json?.data ?? json) as T;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return execute<T>(path, { method: "GET" });
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return execute<T>(path, { method: "POST", body: JSON.stringify(body) });
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return execute<T>(path, { method: "PATCH", body: JSON.stringify(body) });
  },
  delete<T = void>(path: string): Promise<T> {
    return execute<T>(path, { method: "DELETE" });
  },
};
