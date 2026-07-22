import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { apiFetch } from './api-fetch';

// ใช้กับ endpoint ที่ต้องล็อกอิน: ดึง access_token จาก session ของ next-auth มาแนบให้
// ถ้าไม่มี session ให้เด้งไป /login (ทำงานฝั่ง server เท่านั้น เพราะอ่าน session ได้)
export async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = await auth();
  const token = session?.user?.accessToken;
  if (!token) redirect('/login');
  return apiFetch<T>(path, { ...options, token });
}
