import { BookingsApi } from '@/lib/api/bookings.api';
import MyBookingCard from '@/components/features/bookings/MyBookingCard';
import type { ReactNode } from 'react';

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 mb-3 flex items-center gap-2 font-semibold text-navy">
      <span className="h-5 w-1 rounded bg-blue" />{children}
    </p>
  );
}

export default async function MyBookingsPage() {
  const bookings = await BookingsApi.me();
  const now = Date.now();
  const upcoming = bookings.filter((b) => b.status === 'CONFIRMED' && new Date(b.startTime).getTime() > now);
  const history = bookings.filter((b) => !(b.status === 'CONFIRMED' && new Date(b.startTime).getTime() > now));

  return (
    <>
      <h1 className="text-3xl font-bold text-navy">การจองของฉัน</h1>

      <SectionTitle>กำลังจะมาถึง</SectionTitle>
      {upcoming.map((b) => <MyBookingCard key={b.id} booking={b} editable />)}
      {!upcoming.length && <p className="text-sm text-muted">ยังไม่มีการจองที่กำลังจะมาถึง</p>}

      <SectionTitle>ประวัติ</SectionTitle>
      {history.map((b) => <MyBookingCard key={b.id} booking={b} editable={false} />)}
      {!history.length && <p className="text-sm text-muted">ยังไม่มีประวัติการจอง</p>}
    </>
  );
}
