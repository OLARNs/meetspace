import { auth } from '@/lib/auth';
import NavClient from './NavClient';

// RSC: อ่าน session ฝั่ง server แล้วส่งเฉพาะข้อมูลที่ nav ต้องใช้ให้ client component
export default async function Nav() {
  const session = await auth();
  const user = session?.user ? { name: session.user.name ?? '', role: session.user.role } : null;
  return <NavClient user={user} />;
}
