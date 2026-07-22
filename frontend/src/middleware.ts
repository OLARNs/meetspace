import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// ป้องกัน route ระดับกลางทาง: ยังไม่ล็อกอินห้ามเข้าหน้าเหล่านี้,
// ล็อกอินแล้วเด้งออกจาก /login, /register; หน้า /admin ต้อง role ADMIN
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isAuthed = !!session?.user;
  const path = nextUrl.pathname;

  const authPages = path === '/login' || path === '/register';
  const protectedPages =
    path.startsWith('/my-bookings') || path.startsWith('/account') || path.startsWith('/admin');

  if (isAuthed && authPages) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }
  if (!isAuthed && protectedPages) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  // หน้า admin เฉพาะ ADMIN — ไม่ใช่ก็ส่งกลับหน้าแรก
  if (path.startsWith('/admin') && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  // เลี่ยง static/_next และ route ของ next-auth เอง
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
