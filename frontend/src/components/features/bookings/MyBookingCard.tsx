'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Booking } from '@/lib/api/api.type';
import { cancelBookingAction, updateBookingAction } from '@/lib/actions/booking.action';

const input = 'w-full rounded-lg border border-line bg-white p-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';

// แปลง ISO เป็นค่าที่ input date/time ใช้ (เวลาท้องถิ่น)
function toInputValue(d: string) {
  const t = new Date(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`,
    time: `${pad(t.getHours())}:${pad(t.getMinutes())}`,
  };
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

export default function MyBookingCard({ booking, editable }: { booking: Booking; editable: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const s = toInputValue(booking.startTime);
  const e = toInputValue(booking.endTime);
  const [edit, setEdit] = useState<{ open: boolean; date: string; start: string; end: string }>({
    open: false,
    date: s.date,
    start: s.time,
    end: e.time,
  });

  function cancel() {
    if (!confirm('ยืนยันยกเลิกการจองนี้?')) return;
    startTransition(async () => {
      const res = await cancelBookingAction(booking.id);
      if (!res.success) return alert(res.message);
      router.refresh();
    });
  }

  function save(ev: React.FormEvent) {
    ev.preventDefault();
    setError('');
    startTransition(async () => {
      const res = await updateBookingAction({
        id: booking.id,
        startTime: new Date(`${edit.date}T${edit.start}`).toISOString(),
        endTime: new Date(`${edit.date}T${edit.end}`).toISOString(),
      });
      if (!res.success) return setError(res.message);
      setEdit((p) => ({ ...p, open: false }));
      router.refresh();
    });
  }

  const cancelled = booking.status === 'CANCELLED';
  const pill = cancelled ? (
    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600">ยกเลิกแล้ว</span>
  ) : editable ? (
    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">จองสำเร็จ</span>
  ) : (
    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">เสร็จสิ้น</span>
  );

  return (
    <div className="mb-3 rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <p className={`font-semibold ${cancelled ? 'text-muted line-through' : 'text-ink'}`}>{booking.title}</p>
          <p className="mt-1 text-sm text-muted">📍 {booking.room?.name}　📅 {fmtDate(booking.startTime)}　🕐 {fmtTime(booking.startTime)} – {fmtTime(booking.endTime)}</p>
        </div>
        {pill}
        {editable && (
          <span className="flex gap-2">
            <button className="cursor-pointer rounded-lg border border-blue px-3.5 py-1.5 text-sm font-medium text-blue hover:bg-blue hover:text-white disabled:opacity-60" onClick={() => setEdit((p) => ({ ...p, open: !p.open }))} disabled={pending}>แก้ไข</button>
            <button className="cursor-pointer rounded-lg border border-rose-300 px-3.5 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60" onClick={cancel} disabled={pending}>ยกเลิก</button>
          </span>
        )}
      </div>
      {editable && edit.open && (
        <form className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4" onSubmit={save}>
          <div className="min-w-35 flex-1">
            <span className="mb-1 block text-xs font-medium text-muted">วันที่</span>
            <input className={input} type="date" required value={edit.date} onChange={(ev) => setEdit({ ...edit, date: ev.target.value })} />
          </div>
          <div className="min-w-24 flex-1">
            <span className="mb-1 block text-xs font-medium text-muted">เวลาเริ่ม</span>
            <input className={input} type="time" required value={edit.start} onChange={(ev) => setEdit({ ...edit, start: ev.target.value })} />
          </div>
          <div className="min-w-24 flex-1">
            <span className="mb-1 block text-xs font-medium text-muted">เวลาสิ้นสุด</span>
            <input className={input} type="time" required value={edit.end} onChange={(ev) => setEdit({ ...edit, end: ev.target.value })} />
          </div>
          <button className="cursor-pointer rounded-lg bg-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-dark disabled:opacity-60" type="submit" disabled={pending}>บันทึก</button>
          <button className="cursor-pointer rounded-lg border border-line px-4 py-2 text-sm text-muted hover:bg-mist" type="button" onClick={() => setEdit((p) => ({ ...p, open: false }))}>ยกเลิก</button>
          {error && <p className="w-full text-sm text-danger">{error}</p>}
        </form>
      )}
    </div>
  );
}
