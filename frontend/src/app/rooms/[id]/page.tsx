import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RoomsApi } from '@/lib/api/rooms.api';
import { ApiError } from '@/lib/api/api-error';
import BookingForm from '@/components/features/rooms/BookingForm';
import type { RoomDetail } from '@/lib/api/api.type';

function todayStr() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : '');
const th = 'border-b border-line bg-mist p-2.5 text-left text-sm font-semibold text-muted';
const td = 'border-b border-line p-2.5 text-sm';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function RoomDetailPage({ params, searchParams }: Props) {
  let room: RoomDetail;
  try {
    room = await RoomsApi.findOne(params.id);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) notFound();
    throw error;
  }

  // ช่วงเวลาที่เลือกมาจากหน้าแรก (ถ้ามี) ใช้ prefill ฟอร์ม
  const defaults = {
    date: one(searchParams.date) || todayStr(),
    startTime: one(searchParams.start),
    endTime: one(searchParams.end),
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <p className="mb-4"><Link className="text-sm text-muted hover:text-ink" href="/">← Back to search</Link></p>
      <h1 className="text-3xl font-bold text-navy">{room.name}</h1>
      <p className="mt-1 mb-5 text-muted">{room.location} · {room.capacity} seats · {(room.equipment || []).join(', ')}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="self-start rounded-xl border border-line bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-navy">Book This Room</h3>
          <BookingForm roomId={room.id} defaults={defaults} />
        </div>

        <div className="self-start rounded-xl border border-line bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-navy">Upcoming Bookings</h3>
          {room.bookings?.length ? (
            <table className="w-full border-collapse">
              <thead>
                <tr><th className={th}>Time</th><th className={th}>Title</th><th className={th}>Booked by</th></tr>
              </thead>
              <tbody>
                {room.bookings.map((b) => (
                  <tr key={b.id}>
                    <td className={`${td} whitespace-nowrap text-muted`}>{fmtDate(b.startTime)} · {fmtTime(b.startTime)} – {fmtTime(b.endTime)}</td>
                    <td className={`${td} font-medium`}>{b.title}</td>
                    <td className={`${td} text-muted`}>{b.user?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-muted">No bookings yet</p>}
          <div className="mt-4 rounded-lg border border-line bg-mist p-3 text-sm text-muted">
            💡 Pick an available time slot from the table, then fill in the form on the left to book
          </div>
        </div>
      </div>
    </>
  );
}
