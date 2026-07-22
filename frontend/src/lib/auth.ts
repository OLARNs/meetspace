import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { AuthApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/api/api-error';
import type { Role } from '@/lib/api/api.type';

// next-auth v5 หนุนหลังด้วย NestJS API:
// - authorize() เรียก /auth/login แล้วเก็บ accessToken + โปรไฟล์ไว้ใน session
// - session ถือ token ไว้ ให้ authFetch ดึงไปแนบ Bearer เวลาเรียก endpoint ที่ต้องล็อกอิน
export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(input) {
        try {
          const { accessToken, user } = await AuthApi.login({
            email: input.email as string,
            password: input.password as string,
          });
          return { ...user, accessToken };
        } catch (error) {
          // อีเมล/รหัสผิด → คืน null ให้ next-auth ถือว่า login ไม่ผ่าน
          if (error instanceof ApiError) return null;
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    // ย้ายข้อมูลจาก user (ตอน login) เข้า token; รองรับ unstable_update ตอนแก้ชื่อ
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      if (trigger === 'update' && session?.user?.name) {
        token.name = session.user.name;
      }
      return token;
    },
    // เปิดเผยเฉพาะที่ client ต้องใช้ (id, role, accessToken) ผ่าน session.user
    session({ token, session }) {
      session.user.id = token.sub as string;
      session.user.role = token.role as Role;
      session.user.accessToken = token.accessToken as string;
      return session;
    },
  },
});
