'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Booking } from '@/lib/api/api.type';
import { cancelBookingAction } from '@/lib/actions/booking.action';

const th = 'border-b border-line bg-mist p-2.5 text-left text-sm font-semibold text-muted';
const td = 'border-b border-line p-2.5 text-sm';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

export default function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function cancel(id: string) {
    if (!confirm('ยกเลิกการจองนี้แทนผู้ใช้?')) return;
    startTransition(async () => {
      const res = await cancelBookingAction(id);
      if (!res.success) return alert(res.message);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr><th className={th}>หัวข้อ</th><th className={th}>ห้อง</th><th className={th}>ผู้จอง</th><th className={th}>เวลา</th><th className={th}>สถานะ</th><th className={th}>การจัดการ</th></tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr className={b.status === 'CANCELLED' ? 'opacity-60' : ''} key={b.id}>
              <td className={`${td} font-medium`}>{b.title}</td>
              <td className={`${td} text-muted`}>{b.room?.name}</td>
              <td className={td}>{b.user?.name}</td>
              <td className={`${td} whitespace-nowrap text-muted`}>{fmtDate(b.startTime)} · {fmtTime(b.startTime)}–{fmtTime(b.endTime)}</td>
              <td className={td}>
                {b.status === 'CONFIRMED'
                  ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">จองสำเร็จ</span>
                  : <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600">ยกเลิกแล้ว</span>}
              </td>
              <td className={td}>
                {b.status === 'CONFIRMED' && (
                  <button className="cursor-pointer rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60" onClick={() => cancel(b.id)} disabled={pending}>ยกเลิก</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
