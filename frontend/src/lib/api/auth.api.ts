import { apiFetch } from './api-fetch';
import type { AuthResponse } from './api.type';

// endpoint สาธารณะ (ยังไม่มี token) — ใช้ apiFetch ตรง ๆ
export const AuthApi = {
  login(input: { email: string; password: string }) {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  register(input: { name: string; email: string; password: string }) {
    return apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  // ขอ access token ใบใหม่ด้วย refresh token — public (access หมดแล้ว แนบ Bearer ไม่ได้)
  refresh(refreshToken: string) {
    return apiFetch<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
  // ล้าง refreshTokenHash ฝั่ง backend — ต้องแนบ access token ที่ยัง valid
  logout(token: string) {
    return apiFetch<void>('/auth/logout', { method: 'POST', token });
  },
};
