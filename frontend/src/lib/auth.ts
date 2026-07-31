import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { AuthApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/api/api-error';
import type { Role } from '@/lib/api/api.type';

// access token ฝั่ง backend อายุ 15 นาที — ต่ออายุที่ 14 นาที เผื่อ margin กันนาฬิกา 2 เครื่องไม่ตรง
// (ต่อก่อน backend หมดจริง → ไม่มีทางยิงด้วย token ที่หมดแล้วจนโดน 401)
const ACCESS_TOKEN_TTL_MS = 14 * 60 * 1000;

// next-auth v5 หนุนหลังด้วย NestJS API:
// - authorize() เรียก /auth/login แล้วเก็บ access + refresh token ไว้ใน session
// - jwt callback ต่ออายุ access token เองด้วย refresh token เมื่อใกล้หมด (silent refresh)
export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  // cookie ของ next-auth อยู่ได้ 1 ปี + ต่ออายุเองทุกครั้งที่เข้าเว็บ → ให้ยาวพอกับ refresh ที่ไม่หมดอายุ
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 365 },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(input) {
        try {
          const { accessToken, refreshToken, user } = await AuthApi.login({
            email: input.email as string,
            password: input.password as string,
          });
          return { ...user, accessToken, refreshToken };
        } catch (error) {
          // อีเมล/รหัสผิด → คืน null ให้ next-auth ถือว่า login ไม่ผ่าน
          if (error instanceof ApiError) return null;
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    // ย้ายข้อมูลจาก user (ตอน login) เข้า token; รองรับ unstable_update ตอนแก้ชื่อ; ต่ออายุ access token
    async jwt({ token, user, trigger, session }) {
      // 1) ตอน login: เก็บ access + refresh + เวลาที่ควรต่ออายุ
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = Date.now() + ACCESS_TOKEN_TTL_MS;
        return token;
      }
      // 2) แก้ชื่อผ่าน unstable_update (ของเดิม)
      if (trigger === 'update' && session?.user?.name) {
        token.name = session.user.name;
        return token;
      }
      // 3) access ยังไม่ถึงเวลาต่อ → ใช้ต่อได้เลย
      // (cast เพราะ JWT ของ next-auth เป็น Record<string, unknown> — ตามสไตล์เดิมของโปรเจค)
      if (Date.now() < (token.accessTokenExpires as number)) return token;
      // 4) ถึงเวลาต่อ → ขอ access ใบใหม่ด้วย refresh token (เงียบ ๆ user ไม่รู้ตัว)
      try {
        const refreshed = await AuthApi.refresh(token.refreshToken as string);
        token.accessToken = refreshed.accessToken;
        token.refreshToken = refreshed.refreshToken;
        token.accessTokenExpires = Date.now() + ACCESS_TOKEN_TTL_MS;
        token.error = undefined;
      } catch {
        // refresh ถูกเพิกถอน (logout / login เครื่องอื่น / เปลี่ยนรหัส) → ทำเครื่องหมายให้เด้งออก
        token.error = 'RefreshAccessTokenError';
      }
      return token;
    },
    // เปิดเผยเฉพาะที่ client ต้องใช้ (id, role, accessToken) + error ให้ authFetch เช็ค
    session({ token, session }) {
      session.user.id = token.sub as string;
      session.user.role = token.role as Role;
      session.user.accessToken = token.accessToken as string;
      session.error = token.error as 'RefreshAccessTokenError' | undefined;
      return session;
    },
  },
});
