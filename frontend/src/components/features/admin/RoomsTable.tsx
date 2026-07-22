'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Room } from '@/lib/api/api.type';
import { updateRoomAction, setRoomActiveAction } from '@/lib/actions/room.action';

const input = 'w-full rounded-lg border border-line bg-white p-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';
const th = 'border-b border-line bg-mist p-2.5 text-left text-sm font-semibold text-muted';
const td = 'border-b border-line p-2.5 text-sm';
const btn = 'cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-60';

export default function RoomsTable({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [edit, setEdit] = useState<{ id: string; name: string; location: string; capacity: string } | null>(null);
  const [error, setError] = useState('');

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setError('');
    startTransition(async () => {
      const res = await updateRoomAction({ id: edit.id, name: edit.name, location: edit.location, capacity: Number(edit.capacity) });
      if (!res.success) return setError(res.message);
      setEdit(null);
      router.refresh();
    });
  }

  function toggle(room: Room) {
    const ask = room.isActive ? 'ปิดการใช้งานห้องนี้?' : 'เปิดใช้งานห้องนี้อีกครั้ง?';
    if (!confirm(ask)) return;
    startTransition(async () => {
      const res = await setRoomActiveAction(room.id, !room.isActive);
      if (!res.success) return alert(res.message);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto">
      {error && <p className="mb-2 text-sm text-danger">{error}</p>}
      <table className="w-full border-collapse">
        <thead>
          <tr><th className={th}>ชื่อ</th><th className={th}>สถานที่</th><th className={th}>ที่นั่ง</th><th className={th}>สถานะ</th><th className={th}>การจัดการ</th></tr>
        </thead>
        <tbody>
          {rooms.map((r) =>
            edit?.id === r.id ? (
              <tr key={r.id}>
                <td className={td}><input className={input} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></td>
                <td className={td}><input className={input} value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} /></td>
                <td className={td}><input className={input} type="number" min="1" value={edit.capacity} onChange={(e) => setEdit({ ...edit, capacity: e.target.value })} /></td>
                <td className={td} colSpan={2}>
                  <span className="flex gap-2">
                    <button className="cursor-pointer rounded-lg bg-blue px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-dark disabled:opacity-60" onClick={save} disabled={pending}>บันทึก</button>
                    <button className={`${btn} border-line text-muted hover:bg-mist`} onClick={() => setEdit(null)}>ยกเลิก</button>
                  </span>
                </td>
              </tr>
            ) : (
              <tr className={r.isActive ? '' : 'opacity-60'} key={r.id}>
                <td className={`${td} font-medium`}>{r.name}</td>
                <td className={`${td} text-muted`}>{r.location}</td>
                <td className={td}>{r.capacity}</td>
                <td className={td}>
                  {r.isActive
                    ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">เปิดใช้งาน</span>
                    : <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600">ปิดใช้งาน</span>}
                </td>
                <td className={td}>
                  <span className="flex gap-2">
                    <button className={`${btn} border-blue text-blue hover:bg-blue hover:text-white`} onClick={() => setEdit({ id: r.id, name: r.name, location: r.location, capacity: String(r.capacity) })}>แก้ไข</button>
                    {r.isActive
                      ? <button className={`${btn} border-line text-muted hover:bg-mist`} onClick={() => toggle(r)} disabled={pending}>ปิดใช้งาน</button>
                      : <button className={`${btn} border-emerald-300 text-emerald-700 hover:bg-emerald-50`} onClick={() => toggle(r)} disabled={pending}>เปิดใช้งาน</button>}
                  </span>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
