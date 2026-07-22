'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api, getToken } from '../../../lib/api';

const input = 'w-full rounded-lg border border-line bg-white p-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';
const label = 'mb-1 block text-sm font-medium text-ink';
const th = 'border-b border-line bg-mist p-2.5 text-left text-sm font-semibold text-muted';
const td = 'border-b border-line p-2.5 text-sm';

// วันที่เริ่มต้นของฟอร์ม = วันนี้ (ถ้าเลือกช่วงเวลามาจากหน้าแรก ค่าจาก query string จะทับทีหลัง)
function todayStr() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default function RoomDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [form, setForm] = useState({ title: '', date: todayStr(), startTime: '', endTime: '' });
  const [msg, setMsg] = useState({ error: '', ok: '' });

  useEffect(() => { api(`/rooms/${id}`).then(setRoom).catch(() => {}); }, [id]);

  // เติมวัน/เวลาที่เลือกไว้จากหน้าแรกให้อัตโนมัติ (ส่งมาทาง query string) เหลือแค่กรอกหัวข้อ
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('date')) {
      setForm((prev) => ({ ...prev, date: q.get('date'), startTime: q.get('start') || '', endTime: q.get('end') || '' }));
    }
  }, []);

  async function book(e) {
    e.preventDefault();
    setMsg({ error: '', ok: '' });
    if (!getToken()) return router.push('/login'); // Protected: ต้อง login ก่อนจอง
    try {
      await api('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          roomId: id,
          title: form.title,
          startTime: new Date(`${form.date}T${form.startTime}`).toISOString(),
          endTime: new Date(`${form.date}T${form.endTime}`).toISOString()
        })
      });
      setMsg({ error: '', ok: 'จองสำเร็จ!' });
      setForm({ title: '', date: '', startTime: '', endTime: '' }); // เคลียร์ฟอร์มกันเผลอจองซ้ำ
      setRoom(await api(`/rooms/${id}`));
    } catch (err) { setMsg({ error: err.message, ok: '' }); }
  }

  if (!room) return <p className="text-sm text-muted">กำลังโหลด...</p>;
  const fmtDate = (d) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  const fmtTime = (d) => new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <p className="mb-4"><Link className="text-sm text-muted hover:text-ink" href="/">← กลับไปหน้าค้นหา</Link></p>
      <h1 className="text-3xl font-bold text-navy">{room.name}</h1>
      <p className="mt-1 mb-5 text-muted">{room.location} · {room.capacity} ที่นั่ง · {(room.equipment || []).join(', ')}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="self-start rounded-xl border border-line bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-navy">จองห้องประชุม</h3>
          <form className="flex flex-col gap-4" onSubmit={book}>
            <div>
              <span className={label}>หัวข้อการประชุม</span>
              <input className={input} placeholder="Sprint Planning Q3" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <span className={label}>วันที่</span>
              <input className={input} type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="min-w-28 flex-1">
                <span className={label}>เวลาเริ่ม</span>
                <input className={input} type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div className="min-w-28 flex-1">
                <span className={label}>เวลาสิ้นสุด</span>
                <input className={input} type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>
            {msg.error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm">
                <p className="font-semibold text-rose-700">⚠️ จองไม่ได้</p>
                <p className="mt-0.5 text-rose-600">{msg.error}</p>
              </div>
            )}
            {msg.ok && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                ✓ {msg.ok} <Link className="underline hover:text-emerald-900" href="/my-bookings">ดูการจองของฉัน →</Link>
              </div>
            )}
            <button className="cursor-pointer rounded-lg bg-blue px-4 py-2.5 font-medium text-white hover:bg-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue" type="submit">
              ยืนยันการจอง
            </button>
          </form>
        </div>

        <div className="self-start rounded-xl border border-line bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-navy">ตารางการจองที่กำลังจะมาถึง</h3>
          {room.bookings?.length ? (
            <table className="w-full border-collapse">
              <thead>
                <tr><th className={th}>เวลา</th><th className={th}>หัวข้อ</th><th className={th}>ผู้จอง</th></tr>
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
          ) : <p className="text-sm text-muted">ยังไม่มีการจอง</p>}
          <div className="mt-4 rounded-lg border border-line bg-mist p-3 text-sm text-muted">
            💡 เลือกช่วงเวลาที่ว่างจากตาราง แล้วกรอกฟอร์มด้านซ้ายเพื่อทำการจอง
          </div>
        </div>
      </div>
    </>
  );
}
