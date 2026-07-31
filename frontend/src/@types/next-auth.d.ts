import type { DefaultSession } from 'next-auth';
import type { Role } from '@/lib/api/api.type';

// เพิ่มฟิลด์ที่เราแนบเอง (role, accessToken) เข้า type ของ next-auth
declare module 'next-auth' {
  interface User {
    id: string;
    role: Role;
    accessToken: string;
    refreshToken: string;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
      accessToken: string;
    } & DefaultSession['user'];
    // ตั้งเมื่อ refresh token ใช้ไม่ได้แล้ว → authFetch เห็นแล้วเด้งไป login ใหม่
    error?: 'RefreshAccessTokenError';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number; // เวลา (ms) ที่ควรต่ออายุ access token
    error?: 'RefreshAccessTokenError';
  }
}
