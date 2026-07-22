const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function saveAuth({ accessToken, user }) {
  localStorage.setItem('token', accessToken);
  localStorage.setItem('user', JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'เกิดข้อผิดพลาด');
  return data;
}
