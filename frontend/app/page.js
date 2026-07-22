'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getUser } from '../lib/api';
import RoomTimeline from '../components/RoomTimeline';

const input = 'w-full rounded-lg border border-line bg-white p-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';
const label = 'mb-1 block text-sm font-medium text-ink';

// วันที่เริ่มต้น = วันที่เข้ามาใช้ (เวลาเริ่ม/สิ้นสุดปล่อยว่างให้ผู้ใช้เลือกเอง)
function todayStr() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [f, setF] = useState({ keyword: '', minCapacity: '', date: todayStr(), startTime: '', endTime: '' });
  const [error, setError] = useState('');
  const me = getUser();

  // ค้นหาใหม่อัตโนมัติทุกครั้งที่ตัวกรองเปลี่ยน ไม่ต้องกดปุ่ม
  useEffect(() => {
    const params = new URLSearchParams();
    if (f.keyword) params.set('keyword', f.keyword);
    if (f.minCapacity) params.set('minCapacity', f.minCapacity);
    if (f.date && f.startTime && f.endTime) {
      params.set('start', new Date(`${f.date}T${f.startTime}`).toISOString());
      params.set('end', new Date(`${f.date}T${f.endTime}`).toISOString());
    }
    api(`/rooms?${params}`)
      .then((r) => { setRooms(r); setError(''); })
      .catch((err) => setError(err.message));
  }, [f]);

  // ตาราง timeline ของวันที่เลือก
  useEffect(() => {
    if (!f.date) return;
    api(`/rooms/schedule?date=${f.date}`).then(setSchedule).catch(() => {});
  }, [f.date]);

  // ส่งช่วงเวลาที่เลือกติดไปหน้าจองด้วย จะได้ไม่ต้องกรอกซ้ำ
  const slotQuery = f.date && f.startTime && f.endTime
    ? `?date=${f.date}&start=${f.startTime}&end=${f.endTime}`
    : '';

  // timeline แสดงเฉพาะห้องชุดเดียวกับผลค้นหาด้านล่าง (กรองชื่อ/ที่นั่งแล้ว)
  const visibleSchedule = schedule.filter((s) => rooms.some((r) => r.id === s.id));

  // ยังไม่เลือกช่วงเวลา → ไฟสถานะบนการ์ดโชว์ "ตอนนี้" แทน (เช็คว่ามีประชุมคร่อมเวลาปัจจุบันไหม)
  const now = new Date();
  const busyNow = new Set(
    schedule
      .filter((s) => s.bookings.some((b) => new Date(b.startTime) <= now && new Date(b.endTime) > now))
      .map((s) => s.id)
  );
  // ว่างหรือไม่: เลือกช่วงเวลาแล้วใช้ผลจาก API, ยังไม่เลือกและดูวันนี้อยู่ใช้สถานะตอนนี้
  const isFree = (r) => ('available' in r ? r.available : f.date === todayStr() ? !busyNow.has(r.id) : null);

  // ช่วงเวลาที่เลือก (ชั่วโมงทศนิยม) ไว้วาดแถบไฮไลต์บน timeline
  const toHour = (t) => Number(t.slice(0, 2)) + Number(t.slice(3, 5)) / 60;
  const slot = f.startTime && f.endTime ? { from: toHour(f.startTime), to: toHour(f.endTime) } : null;

  const dateLabel = f.date
    ? new Date(`${f.date}T00:00:00`).toLocaleDateString('th-TH', { dateStyle: 'long' })
    : '';

  return (
    <>
      <h1 className="text-3xl font-bold text-navy">จองห้องประชุม</h1>
      <p className="mt-1 mb-5 text-muted">ค้นหาและจองห้องประชุมที่ว่างสำหรับทีมของคุณ</p>

      <div className="mb-5 rounded-xl border border-line bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-navy">ค้นหาห้องว่าง</h3>
        <div className="flex flex-wrap gap-3">
          <div className="min-w-52 flex-2">
            <span className={label}>ชื่อห้องประชุม</span>
            <input className={input} placeholder="เช่น Room A, Board Room..." value={f.keyword} onChange={(e) => setF({ ...f, keyword: e.target.value })} />
          </div>
          <div className="min-w-24 flex-1">
            <span className={label}>ที่นั่งขั้นต่ำ</span>
            <input className={input} type="number" min="1" placeholder="ไม่ระบุ" value={f.minCapacity} onChange={(e) => setF({ ...f, minCapacity: e.target.value })} />
          </div>
          <div className="min-w-35 flex-1">
            <span className={label}>วันที่</span>
            <input className={input} type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </div>
          <div className="min-w-28 flex-1">
            <span className={label}>เวลาเริ่ม</span>
            <input className={input} type="time" value={f.startTime} onChange={(e) => setF({ ...f, startTime: e.target.value })} />
          </div>
          <div className="min-w-28 flex-1">
            <span className={label}>เวลาสิ้นสุด</span>
            <input className={input} type="time" value={f.endTime} onChange={(e) => setF({ ...f, endTime: e.target.value })} />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">
          เลือกวันและช่วงเวลาที่จะประชุม ผลด้านล่างอัพเดตทันทีไม่ต้องกดปุ่ม — ชื่อห้องกับที่นั่งเว้นว่างได้ (= เอาทุกห้อง)
        </p>
        {error && <p className="mt-2 text-danger">{error}</p>}
      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm text-muted">{dateLabel}</p>
        <RoomTimeline rooms={visibleSchedule} meId={me?.id} date={f.date} slot={slot} />
      </div>

      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold text-navy">ห้องประชุมทั้งหมด</h3>
        {rooms.length > 0 && 'available' in rooms[0] ? (
          <span className="text-sm text-muted">
            ว่าง {rooms.filter((r) => r.available).length} จาก {rooms.length} ห้อง · ช่วง {f.startTime}–{f.endTime} น.
          </span>
        ) : (
          <span className="text-sm text-muted">เลือกเวลาเริ่ม–สิ้นสุดด้านบน เพื่อเช็คว่าห้องไหนว่าง</span>
        )}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {rooms.map((r) => (
          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm" key={r.id}>
            <div className="flex items-start justify-between gap-2 bg-navy p-4">
              <div>
                <p className="text-[11px] font-medium tracking-widest text-slate-400 uppercase">{r.location}</p>
                <p className="text-lg font-bold text-white">{r.name}</p>
              </div>
              {isFree(r) !== null && (
                <span className={`flex items-center gap-1.5 text-sm ${isFree(r) ? 'text-teal-300' : 'text-rose-400'}`}>
                  <span className={`h-2 w-2 rounded-full ${isFree(r) ? 'bg-teal-300' : 'bg-rose-400'}`} />
                  {isFree(r) ? 'ว่าง' : 'ไม่ว่าง'}
                </span>
              )}
            </div>
            <div className="p-4">
              <p className="mb-3 text-sm text-muted">👥 {r.capacity} ที่นั่ง · {(r.equipment || []).join(' · ')}</p>
              <Link
                className="block rounded-lg bg-blue px-4 py-2.5 text-center font-medium text-white hover:bg-blue-dark"
                href={`/rooms/${r.id}${slotQuery}`}
              >
                รายละเอียด / จอง
              </Link>
            </div>
          </div>
        ))}
      </div>
      {!rooms.length && !error && <p className="text-sm text-muted">ไม่พบห้องที่ตรงกับตัวกรอง</p>}
    </>
  );
}
