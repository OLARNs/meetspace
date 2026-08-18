import { auth } from '@/lib/auth';
import { apiFetch } from '@/lib/api/api-fetch';
import type { Me } from '@/lib/api/api.type';
import NavClient from './NavClient';

// RSC: อ่าน session ฝั่ง server แล้วส่งเฉพาะข้อมูลที่ nav ต้องใช้ให้ client component
export default async function Nav() {
  const session = await auth();
  if (!session?.user) return <NavClient user={null} />;

  // ดึง avatarUrl มาโชว์ใน nav — ใช้ apiFetch ตรง ๆ (ไม่ redirect) ถ้าพลาดก็แค่ตกไปเป็นตัวย่อชื่อ
  let avatarUrl: string | null = null;
  try {
    const me = await apiFetch<Me>('/users/me', { token: session.user.accessToken });
    avatarUrl = me.avatarUrl;
  } catch {
    // เพิกเฉย
  }

  return <NavClient user={{ name: session.user.name ?? '', role: session.user.role, avatarUrl }} />;
}
