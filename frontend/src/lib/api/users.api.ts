import { authFetch } from './auth-fetch';
import type { Me } from './api.type';

export const UsersApi = {
  me() {
    return authFetch<Me>('/users/me');
  },
  updateMe(input: { name?: string; currentPassword?: string; newPassword?: string }) {
    return authFetch<Me>('/users/me', { method: 'PATCH', body: JSON.stringify(input) });
  },
};
