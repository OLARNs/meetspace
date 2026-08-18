import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch } from './api-fetch';
import { ApiError } from './api-error';

// ใช้กับ endpoint ที่ต้องล็อกอิน: ดึง access_token จาก session ของ next-auth มาแนบให้
// jwt callback จะต่ออายุ access token ให้อัตโนมัติก่อนถึงตรงนี้ (silent refresh)
// ถ้าไม่มี session / refresh ถูกเพิกถอน (session.error) ให้เด้งไปล้าง session แล้ว login ใหม่
export async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = await auth();
  const token = session?.user?.accessToken;
  if (!token || session?.error) redirect('/auth/expired');
  try {
    return await apiFetch<T>(path, { ...options, token });
  } catch (err) {
    // backstop: token ถูกปฏิเสธ (backend ตอบ 401) → ล้าง session ที่ค้างแล้วให้ล็อกอินใหม่
    if (err instanceof ApiError && err.statusCode === 401) redirect('/auth/expired');
    throw err;
  }
}
