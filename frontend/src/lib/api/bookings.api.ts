import { authFetch } from './auth-fetch';
import type { Booking } from './api.type';

export const BookingsApi = {
  create(input: { roomId: string; title: string; startTime: string; endTime: string }) {
    return authFetch<Booking>('/bookings', { method: 'POST', body: JSON.stringify(input) });
  },
  // การจองของตัวเอง
  me() {
    return authFetch<Booking[]>('/bookings/me');
  },
  // การจองทั้งหมด (admin)
  all() {
    return authFetch<Booking[]>('/bookings');
  },
  update(id: string, input: Partial<{ title: string; startTime: string; endTime: string }>) {
    return authFetch<Booking>(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  // ยกเลิก: API เปลี่ยน status เป็น CANCELLED (ไม่ลบ record)
  cancel(id: string) {
    return authFetch<Booking>(`/bookings/${id}`, { method: 'DELETE' });
  },
};
