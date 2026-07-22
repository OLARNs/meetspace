import type { DefaultSession } from 'next-auth';
import type { Role } from '@/lib/api/api.type';

// เพิ่มฟิลด์ที่เราแนบเอง (role, accessToken) เข้า type ของ next-auth
declare module 'next-auth' {
  interface User {
    id: string;
    role: Role;
    accessToken: string;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
      accessToken: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
    accessToken: string;
  }
}
