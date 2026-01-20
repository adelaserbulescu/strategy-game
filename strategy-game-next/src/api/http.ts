const API_BASE = process.env.NEXT_PUBLIC_USER_API ?? "http://localhost:8082";

function getTokenSafe(): string | null {
  // Avoid SSR / "window is not defined" crashes
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("token");
  } catch {
    return null;
  }
}

function normalizeHeaders(
    headers: RequestInit["headers"]
): Record<string, string> {
  if (!headers) return {};

  // If it's already a plain object
  if (typeof headers === "object" && !Array.isArray(headers) && !(headers instanceof Headers)) {
    return headers as Record<string, string>;
  }

  // If it's Headers or tuple array, convert to object
  return Object.fromEntries(new Headers(headers).entries());
}

export async function http<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
  const token = getTokenSafe();

  const baseHeaders = normalizeHeaders(options.headers);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...baseHeaders,
    },
  });

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  // Read body safely once
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const message =
        (typeof body === "string" && body) ||
        (body && typeof body === "object" && (body.message || body.error)) ||
        `Request failed (${res.status})`;

    throw new Error(message);
  }

  return body as T;
}
