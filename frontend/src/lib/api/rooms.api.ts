import { apiFetch } from './api-fetch';
import { authFetch } from './auth-fetch';
import type { Room, RoomDetail, ScheduleRoom } from './api.type';

export type SearchParams = {
  keyword?: string;
  minCapacity?: string;
  start?: string;
  end?: string;
  all?: string;
};

export const RoomsApi = {
  // ค้นหา/รายการห้อง (สาธารณะ) — all=true สำหรับหน้า admin ให้เห็นห้องที่ปิดใช้งานด้วย
  search(params: SearchParams = {}) {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][]
    );
    return apiFetch<Room[]>(`/rooms?${q}`);
  },
  // ตาราง timeline รายวันของทุกห้อง (สาธารณะ)
  schedule(date: string) {
    return apiFetch<ScheduleRoom[]>(`/rooms/schedule?date=${date}`);
  },
  findOne(id: string) {
    return apiFetch<RoomDetail>(`/rooms/${id}`);
  },
  create(input: { name: string; location: string; capacity: number; equipment: string[] }) {
    return authFetch<Room>('/rooms', { method: 'POST', body: JSON.stringify(input) });
  },
  update(id: string, input: Partial<{ name: string; location: string; capacity: number; isActive: boolean }>) {
    return authFetch<Room>(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  // soft delete: API เซ็ต isActive=false
  remove(id: string) {
    return authFetch<Room>(`/rooms/${id}`, { method: 'DELETE' });
  },
};
