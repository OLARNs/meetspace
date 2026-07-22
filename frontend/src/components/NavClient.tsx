'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/lib/api/api.type';
import { logoutAction } from '@/lib/actions/auth.action';

type Props = { user: { name: string; role: Role } | null };

// ลิงก์เมนู: หน้าปัจจุบันเป็น pill สว่าง ตัวอื่นสีจาง
const navLink = (active: boolean) =>
  `rounded-lg px-3.5 py-1.5 text-sm ${active ? 'bg-white/10 font-medium text-teal-200' : 'text-slate-300 hover:text-white'}`;

export default function NavClient({ user }: Props) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2 bg-navy px-6 py-3 text-white">
      <Link className="mr-5 font-display text-xl font-bold tracking-wide" href="/">
        MeetSpace
        <span className="ml-1.5 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,.55)]" />
      </Link>
      <Link className={navLink(pathname === '/')} href="/">ค้นหาห้อง</Link>
      {user && <Link className={navLink(pathname === '/my-bookings')} href="/my-bookings">การจองของฉัน</Link>}
      {user && <Link className={navLink(pathname === '/account')} href="/account">บัญชีของฉัน</Link>}
      <span className="mr-auto" />
      {/* เมนูผู้ดูแลระบบเห็นเฉพาะ role ADMIN */}
      {user?.role === 'ADMIN' && <Link className={navLink(pathname === '/admin')} href="/admin">ผู้ดูแลระบบ</Link>}
      {user ? (
        <form action={logoutAction}>
          <button className="cursor-pointer rounded-lg border border-white/25 px-4 py-1.5 text-sm text-slate-200 hover:bg-white/10" type="submit">
            ออกจากระบบ · {user.name}
          </button>
        </form>
      ) : (
        <Link className="rounded-lg bg-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-dark" href="/login">
          เข้าสู่ระบบ
        </Link>
      )}
    </nav>
  );
}
