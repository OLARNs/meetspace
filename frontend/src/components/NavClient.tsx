'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/lib/api/api.type';
import { logoutAction } from '@/lib/actions/auth.action';
import { Button } from '@/components/ui/button';

type Props = { user: { name: string; role: Role } | null };

// ลิงก์เมนู: หน้าปัจจุบันเป็น pill สว่าง ตัวอื่นสีจาง
const navLink = (active: boolean) =>
  `rounded-lg px-3.5 py-1.5 text-sm ${active ? 'bg-white/10 font-medium text-teal-200' : 'text-slate-300 hover:text-white'}`;

export default function NavClient({ user }: Props) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2 bg-navy px-6 py-3 text-white">
      <Link className="mr-5 flex items-center gap-2 font-display text-xl font-bold tracking-wide" href="/">
        <Image src="/logo.png" alt="MeetSpace" width={48} height={32} className="h-8 w-auto object-contain" priority />
        MeetSpace
      </Link>
      <Link className={navLink(pathname === '/')} href="/">Search Rooms</Link>
      {user && <Link className={navLink(pathname === '/my-bookings')} href="/my-bookings">My Bookings</Link>}
      {user && <Link className={navLink(pathname === '/account')} href="/account">My Account</Link>}
      <span className="mr-auto" />
      {/* เมนูผู้ดูแลระบบเห็นเฉพาะ role ADMIN */}
      {user?.role === 'ADMIN' && <Link className={navLink(pathname === '/admin')} href="/admin">Admin</Link>}
      {user ? (
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="border-white/25 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white"
          >
            Sign out · {user.name}
          </Button>
        </form>
      ) : (
        <Button asChild className="h-9 hover:bg-blue-dark">
          <Link href="/login">Sign In</Link>
        </Button>
      )}
    </nav>
  );
}
