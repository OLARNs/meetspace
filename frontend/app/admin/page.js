'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getUser } from '../../lib/api';

const input = 'w-full rounded-lg border border-line bg-white p-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';
const label = 'mb-1 block text-sm font-medium text-ink';
const th = 'border-b border-line bg-mist p-2.5 text-left text-sm font-semibold text-muted';
const td = 'border-b border-line p-2.5 text-sm';
const btnOutline = 'cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium';

function StatCard({ icon, value, unit, color }) {
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

export default function Admin() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ name: '', location: '', capacity: '', equipment: '' });
  const [editing, setEditing] = useState(null); // { id, name, location, capacity }
  const [error, setError] = useState('');

  async function load() {
    setRooms(await api('/rooms?all=true')); // admin ขอดูรวมห้องที่ปิดใช้งานด้วย
    setBookings(await api('/bookings'));
  }

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'ADMIN') return router.push('/login'); // Admin เท่านั้น
    load().catch((e) => setError(e.message));
  }, []);

  async function addRoom(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          location: form.location,
          capacity: Number(form.capacity),
          equipment: form.equipment.split(',').map((s) => s.trim()).filter(Boolean)
        })
      });
      setForm({ name: '', location: '', capacity: '', equipment: '' });
      load();
    } catch (err) { setError(err.message); }
  }

  async function saveRoom(e) {
    e.preventDefault();
    setError('');
    try {
      await api(`/rooms/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editing.name, location: editing.location, capacity: Number(editing.capacity) })
      });
      setEditing(null);
      await load();
    } catch (err) { setError(err.message); }
  }

  async function setActive(room, isActive) {
    const ask = isActive ? 'เปิดใช้งานห้องนี้อีกครั้ง?' : 'ปิดการใช้งานห้องนี้?';
    if (!confirm(ask)) return;
    try {
      // ปิด = soft delete (DELETE เซ็ต isActive=false), เปิดคืน = PATCH isActive=true
      if (isActive) await api(`/rooms/${room.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: true }) });
      else await api(`/rooms/${room.id}`, { method: 'DELETE' });
      await load();
    } catch (err) { setError(err.message); }
  }

  async function cancelBooking(id) {
    if (!confirm('ยกเลิกการจองนี้แทนผู้ใช้?')) return;
    try {
      await api(`/bookings/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) { setError(err.message); }
  }

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
  // อัตราการใช้ห้อง = ชั่วโมงที่ถูกจองสัปดาห์นี้ ÷ ชั่วโมงเปิดให้จองทั้งหมด (ห้อง × 10 ชม. × 7 วัน)
  const bookedHours = weekBookings.reduce((sum, b) => sum + (new Date(b.endTime) - new Date(b.startTime)) / 3600000, 0);
  const capacityHours = activeRooms.length * 10 * 7;
  const utilization = capacityHours ? Math.round((bookedHours / capacityHours) * 100) : 0;

  const fmtDate = (d) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  const fmtTime = (d) => new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <h1 className="flex items-center gap-3 text-3xl font-bold text-navy">
        จัดการระบบ
        <span className="rounded-full bg-navy px-3 py-1 text-xs font-semibold tracking-widest text-teal-200">ADMIN</span>
      </h1>
      {error && <p className="mt-3 text-danger">{error}</p>}

      <div className="mt-5 mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard icon="🏢" value={activeRooms.length} unit="ห้องที่เปิดใช้งาน" color="text-blue" />
        <StatCard icon="📅" value={weekBookings.length} unit="การจองสัปดาห์นี้" color="text-violet-600" />
        <StatCard icon="📊" value={`${utilization}%`} unit="อัตราการใช้ห้อง" color="text-emerald-600" />
      </div>

      <div className="mb-5 rounded-xl border border-line bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-navy">เพิ่มห้องประชุม</h3>
        <form className="flex flex-wrap items-end gap-3" onSubmit={addRoom}>
          <div className="min-w-40 flex-2">
            <span className={label}>ชื่อห้อง</span>
            <input className={input} placeholder="Conference Room C" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="min-w-28 flex-1">
            <span className={label}>สถานที่</span>
            <input className={input} placeholder="ชั้น 3" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="min-w-24 flex-1">
            <span className={label}>ที่นั่ง</span>
            <input className={input} type="number" min="1" placeholder="10" required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </div>
          <div className="min-w-40 flex-2">
            <span className={label}>อุปกรณ์ (คั่นด้วย ,)</span>
            <input className={input} placeholder="Projector, TV" value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} />
          </div>
          <button className="cursor-pointer rounded-lg bg-blue px-4 py-2.5 font-medium text-white hover:bg-blue-dark" type="submit">+ เพิ่มห้อง</button>
        </form>
      </div>

      <div className="mb-5 rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-lg font-bold text-navy">ห้องประชุมทั้งหมด</h3>
          <span className="text-sm text-muted">{rooms.length} รายการ</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr><th className={th}>ชื่อ</th><th className={th}>สถานที่</th><th className={th}>ที่นั่ง</th><th className={th}>สถานะ</th><th className={th}>การจัดการ</th></tr>
            </thead>
            <tbody>
              {rooms.map((r) =>
                editing?.id === r.id ? (
                  <tr key={r.id}>
                    <td className={td}><input className={input} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></td>
                    <td className={td}><input className={input} value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></td>
                    <td className={td}><input className={input} type="number" min="1" value={editing.capacity} onChange={(e) => setEditing({ ...editing, capacity: e.target.value })} /></td>
                    <td className={td} colSpan={2}>
                      <span className="flex gap-2">
                        <button className="cursor-pointer rounded-lg bg-blue px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-dark" onClick={saveRoom}>บันทึก</button>
                        <button className={`${btnOutline} border-line text-muted hover:bg-mist`} onClick={() => setEditing(null)}>ยกเลิก</button>
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
                        <button className={`${btnOutline} border-blue text-blue hover:bg-blue hover:text-white`} onClick={() => setEditing({ id: r.id, name: r.name, location: r.location, capacity: r.capacity })}>แก้ไข</button>
                        {r.isActive
                          ? <button className={`${btnOutline} border-line text-muted hover:bg-mist`} onClick={() => setActive(r, false)}>ปิดใช้งาน</button>
                          : <button className={`${btnOutline} border-emerald-300 text-emerald-700 hover:bg-emerald-50`} onClick={() => setActive(r, true)}>เปิดใช้งาน</button>}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-line bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-lg font-bold text-navy">การจองทั้งหมด</h3>
          <span className="text-sm text-muted">{bookings.length} รายการ</span>
        </div>
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
                      <button className={`${btnOutline} border-rose-300 text-rose-600 hover:bg-rose-50`} onClick={() => cancelBooking(b.id)}>ยกเลิก</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
