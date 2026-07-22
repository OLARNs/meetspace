'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken } from '../../lib/api';

const input = 'w-full rounded-lg border border-line bg-white p-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';

// แปลง Date เป็นค่าที่ input type=date/time ใช้ (เป็นเวลาท้องถิ่น ไม่ใช่ UTC)
function toInputValue(d) {
  const t = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    date: `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`,
    time: `${pad(t.getHours())}:${pad(t.getMinutes())}`
  };
}

function SectionTitle({ children }) {
  return (
    <p className="mt-6 mb-3 flex items-center gap-2 font-semibold text-navy">
      <span className="h-5 w-1 rounded bg-blue" />{children}
    </p>
  );
}

export default function MyBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [editing, setEditing] = useState(null); // { id, date, startTime, endTime }
  const [error, setError] = useState('');

  async function load() { setBookings(await api('/bookings/me')); }

  useEffect(() => {
    if (!getToken()) return router.push('/login'); // Protected Route
    load().catch(() => {});
  }, []);

  async function cancel(id) {
    if (!confirm('ยืนยันยกเลิกการจองนี้?')) return;
    try {
      await api(`/bookings/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) { alert(err.message); }
  }

  function startEdit(b) {
    const s = toInputValue(b.startTime);
    const e = toInputValue(b.endTime);
    setError('');
    setEditing({ id: b.id, date: s.date, startTime: s.time, endTime: e.time });
  }

  async function saveEdit(e) {
    e.preventDefault();
    setError('');
    try {
      await api(`/bookings/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          startTime: new Date(`${editing.date}T${editing.startTime}`).toISOString(),
          endTime: new Date(`${editing.date}T${editing.endTime}`).toISOString()
        })
      });
      setEditing(null);
      await load();
    } catch (err) { setError(err.message); }
  }

  const now = new Date();
  const upcoming = bookings.filter((b) => b.status === 'CONFIRMED' && new Date(b.startTime) > now);
  const history = bookings.filter((b) => !(b.status === 'CONFIRMED' && new Date(b.startTime) > now));

  const fmtDate = (d) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtTime = (d) => new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  const pill = (b) => {
    if (b.status === 'CANCELLED') return <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600">ยกเลิกแล้ว</span>;
    if (new Date(b.startTime) <= now) return <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">เสร็จสิ้น</span>;
    return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">จองสำเร็จ</span>;
  };

  const card = (b, actions) => (
    <div className="mb-3 rounded-xl border border-line bg-white p-5 shadow-sm" key={b.id}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <p className={`font-semibold ${b.status === 'CANCELLED' ? 'text-muted line-through' : 'text-ink'}`}>{b.title}</p>
          <p className="mt-1 text-sm text-muted">📍 {b.room?.name}　📅 {fmtDate(b.startTime)}　🕐 {fmtTime(b.startTime)} – {fmtTime(b.endTime)}</p>
        </div>
        {pill(b)}
        {actions}
      </div>
      {editing?.id === b.id && (
        <form className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4" onSubmit={saveEdit}>
          <div className="min-w-35 flex-1">
            <span className="mb-1 block text-xs font-medium text-muted">วันที่</span>
            <input className={input} type="date" required value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
          </div>
          <div className="min-w-24 flex-1">
            <span className="mb-1 block text-xs font-medium text-muted">เวลาเริ่ม</span>
            <input className={input} type="time" required value={editing.startTime} onChange={(e) => setEditing({ ...editing, startTime: e.target.value })} />
          </div>
          <div className="min-w-24 flex-1">
            <span className="mb-1 block text-xs font-medium text-muted">เวลาสิ้นสุด</span>
            <input className={input} type="time" required value={editing.endTime} onChange={(e) => setEditing({ ...editing, endTime: e.target.value })} />
          </div>
          <button className="cursor-pointer rounded-lg bg-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-dark" type="submit">บันทึก</button>
          <button className="cursor-pointer rounded-lg border border-line px-4 py-2 text-sm text-muted hover:bg-mist" type="button" onClick={() => setEditing(null)}>ยกเลิก</button>
          {error && <p className="w-full text-sm text-danger">{error}</p>}
        </form>
      )}
    </div>
  );

  return (
    <>
      <h1 className="text-3xl font-bold text-navy">การจองของฉัน</h1>

      <SectionTitle>กำลังจะมาถึง</SectionTitle>
      {upcoming.map((b) =>
        card(
          b,
          <span className="flex gap-2">
            <button className="cursor-pointer rounded-lg border border-blue px-3.5 py-1.5 text-sm font-medium text-blue hover:bg-blue hover:text-white" onClick={() => startEdit(b)}>แก้ไข</button>
            <button className="cursor-pointer rounded-lg border border-rose-300 px-3.5 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50" onClick={() => cancel(b.id)}>ยกเลิก</button>
          </span>
        )
      )}
      {!upcoming.length && <p className="text-sm text-muted">ยังไม่มีการจองที่กำลังจะมาถึง</p>}

      <SectionTitle>ประวัติ</SectionTitle>
      {history.map((b) => card(b, null))}
      {!history.length && <p className="text-sm text-muted">ยังไม่มีประวัติการจอง</p>}
    </>
  );
}
