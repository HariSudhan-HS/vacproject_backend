const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export type Food = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string | { _id: string; name: string };
  isAvailable?: boolean;
  isVegetarian?: boolean;
  rating?: number;
};

export type Category = { _id: string; name: string; slug?: string };
export type CartLine = { food: Food; quantity: number; _id?: string };
export type Order = {
  _id: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: string;
  createdAt: string;
};
export type User = { id: string; name: string; email: string; role: "customer" | "admin" };

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("food-token") : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });
  if (response.status === 204) return undefined as T;
  let payload: {
    data?: T;
    message?: string;
    error?: string | { message?: string };
  };
  try {
    payload = await response.json() as typeof payload;
  } catch {
    throw new Error(response.ok ? "The API returned an invalid response." : `Request failed (${response.status})`);
  }
  if (!response.ok) {
    const message = typeof payload.error === "string" ? payload.error : payload.error?.message;
    let errorMessage = message ?? payload.message ?? `Request failed (${response.status})`;
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("Retry-After"));
      if (Number.isFinite(retryAfter) && retryAfter > 0) {
        const waitTime = retryAfter < 60
          ? `${retryAfter} seconds`
          : `about ${Math.ceil(retryAfter / 60)} minutes`;
        errorMessage = `${errorMessage} Please try again in ${waitTime}.`;
      }
    }
    throw new ApiError(errorMessage, response.status);
  }
  return payload.data ?? payload as T;
}

export function imageFor(food: Pick<Food, "image" | "name">): string {
  return food.image || `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80`;
}
