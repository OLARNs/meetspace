// route handler เดียวที่มีในโปรเจค — ให้ next-auth จัดการ /api/auth/* (login/logout/session)
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
