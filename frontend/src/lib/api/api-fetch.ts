import { ApiError } from './api-error';

// ปลายทาง API อ่านจาก env ฝั่ง server (BFF) — เบราว์เซอร์ไม่เรียก API ตรง
const BASE_URL = process.env.API_URL ?? 'http://localhost:3001';

type FetchOptions = RequestInit & { token?: string };

// fetch กลางตัวเดียวของทั้งเว็บ: ใส่ Bearer ให้ถ้ามี token, แปลง error เป็น ApiError
export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers, body, ...rest } = options;
  const isFormData = body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    body,
    headers: {
      // ไม่เซ็ต Content-Type ตอนเป็น FormData เผื่อรองรับอัปโหลดไฟล์ในอนาคต
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: 'no-store',
  });

  const text = await res.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : undefined;

  if (!res.ok) {
    const raw = data && typeof data === 'object' && 'message' in data ? (data as { message: unknown }).message : res.statusText;
    // NestJS ValidationPipe คืน message เป็น array ได้ — รวมเป็นบรรทัดเดียว
    const message = Array.isArray(raw) ? raw.join(', ') : String(raw);
    throw new ApiError(res.status, message);
  }

  return data as T;
}
