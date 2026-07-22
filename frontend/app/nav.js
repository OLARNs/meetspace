'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser, logout } from '../lib/api';

// ลิงก์เมนู: หน้าปัจจุบันเป็น pill สว่าง ตัวอื่นเป็นสีจาง
const navLink = (active) =>
  `rounded-lg px-3.5 py-1.5 text-sm ${active ? 'bg-white/10 font-medium text-teal-200' : 'text-slate-300 hover:text-white'}`;

export default function Nav() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    // อัปเดตชื่อบน nav ทันทีเมื่อผู้ใช้แก้ชื่อในหน้า "บัญชีของฉัน"
    window.addEventListener('user-updated', sync);
    return () => window.removeEventListener('user-updated', sync);
  }, []);

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
      {/* เมนูผู้ดูแลระบบเห็นเฉพาะบัญชีที่ role เป็น ADMIN เท่านั้น */}
      {user?.role === 'ADMIN' && <Link className={navLink(pathname === '/admin')} href="/admin">ผู้ดูแลระบบ</Link>}
      {user ? (
        <button
          className="cursor-pointer rounded-lg border border-white/25 px-4 py-1.5 text-sm text-slate-200 hover:bg-white/10"
          onClick={logout}
        >
          ออกจากระบบ · {user.name}
        </button>
      ) : (
        <Link className="rounded-lg bg-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-dark" href="/login">
          เข้าสู่ระบบ
        </Link>
      )}
    </nav>
  );
}
