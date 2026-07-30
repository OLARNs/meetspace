import { RoomsApi } from '@/lib/api/rooms.api';
import { BookingsApi } from '@/lib/api/bookings.api';
import AddRoomForm from '@/components/features/admin/AddRoomForm';
import RoomsTable from '@/components/features/admin/RoomsTable';
import BookingsTable from '@/components/features/admin/BookingsTable';

function StatCard({ icon, value, unit, color }: { icon: string; value: string | number; unit: string; color: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-5 shadow-sm">
      <span className="rounded-lg bg-mist p-3 text-2xl">{icon}</span>
      <div>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-muted">{unit}</p>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const [rooms, bookings] = await Promise.all([
    RoomsApi.search({ all: 'true' }), // รวมห้องที่ปิดใช้งานด้วย
    BookingsApi.all(),
  ]);

  // ===== สถิติด้านบน =====
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); // จันทร์ของสัปดาห์นี้
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const activeRooms = rooms.filter((r) => r.isActive);
  const weekBookings = bookings.filter(
    (b) => b.status === 'CONFIRMED' && new Date(b.startTime) >= weekStart && new Date(b.startTime) < weekEnd
  );
  const bookedHours = weekBookings.reduce((sum, b) => sum + (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / 3600000, 0);
  const capacityHours = activeRooms.length * 10 * 7; // ห้อง × 10 ชม./วัน × 7 วัน
  const utilization = capacityHours ? Math.round((bookedHours / capacityHours) * 100) : 0;

  return (
    <>
      <h1 className="flex items-center gap-3 text-3xl font-bold text-navy">
        Admin Dashboard
        <span className="rounded-full bg-navy px-3 py-1 text-xs font-semibold tracking-widest text-teal-200">ADMIN</span>
      </h1>

      <div className="mt-5 mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard icon="🏢" value={activeRooms.length} unit="Active rooms" color="text-blue" />
        <StatCard icon="📅" value={weekBookings.length} unit="Bookings this week" color="text-violet-600" />
        <StatCard icon="📊" value={`${utilization}%`} unit="Utilization rate" color="text-emerald-600" />
      </div>

      <div className="mb-5 rounded-xl border border-line bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-navy">Add Meeting Room</h3>
        <AddRoomForm />
      </div>

      <div className="mb-5 rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-lg font-bold text-navy">All Meeting Rooms</h3>
          <span className="text-sm text-muted">{rooms.length} items</span>
        </div>
        <RoomsTable rooms={rooms} />
      </div>

      <div className="mb-5 rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-lg font-bold text-navy">All Bookings</h3>
          <span className="text-sm text-muted">{bookings.length} items</span>
        </div>
        <BookingsTable bookings={bookings} />
      </div>
    </>
  );
}
