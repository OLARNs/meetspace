import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch } from './api-fetch';
import { ApiError } from './api-error';

// ใช้กับ endpoint ที่ต้องล็อกอิน: ดึง access_token จาก session ของ next-auth มาแนบให้
// ถ้าไม่มี session ให้เด้งไป /login (ทำงานฝั่ง server เท่านั้น เพราะอ่าน session ได้)
export async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = await auth();
  const token = session?.user?.accessToken;
  if (!token) redirect('/login');
  try {
    return await apiFetch<T>(path, { ...options, token });
  } catch (err) {
    // token หมดอายุ/ใช้ไม่ได้ (backend ตอบ 401) → ล้าง session ที่ค้างแล้วให้ล็อกอินใหม่
    // แทนที่จะปล่อยให้หน้าเว็บพังด้วย ApiError('Unauthorized')
    if (err instanceof ApiError && err.statusCode === 401) redirect('/auth/expired');
    throw err;
  }
}
