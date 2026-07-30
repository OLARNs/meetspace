import { signOut } from '@/lib/auth';

// ปลายทางกลางสำหรับกรณี "backend token หมดอายุ":
// authFetch เจอ 401 แล้วเด้งมาที่นี่ → ล้าง session ของ next-auth ที่ค้างอยู่ (ถือ token เก่าที่หมดอายุ)
// แล้วส่งต่อไปหน้า login พร้อม ?expired=1 เพื่อแจ้งผู้ใช้ว่าต้องเข้าสู่ระบบใหม่
// ต้องทำใน Route Handler เพราะ signOut ต้องแก้ cookie — ทำระหว่าง RSC render ไม่ได้
export async function GET() {
  await signOut({ redirectTo: '/login?expired=1' });
}
