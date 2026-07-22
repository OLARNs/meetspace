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
};
