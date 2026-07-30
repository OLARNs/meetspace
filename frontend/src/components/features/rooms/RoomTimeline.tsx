'use client';
import { useEffect, useState } from 'react';
import type { ScheduleRoom } from '@/lib/api/api.type';

// ตาราง timeline การใช้ห้องรายวัน (08:00–18:00)
// meId ใช้แยกสี "ของคุณ" (เหลือง) ออกจากของคนอื่น (แดง); slot = ช่วงเวลาที่เลือกจากตัวกรอง
const START = 8;
const END = 18;
const HOURS = Array.from({ length: END - START }, (_, i) => START + i);

const toHour = (d: string) => new Date(d).getHours() + new Date(d).getMinutes() / 60;

type Block = { left: number; width: number };
function toBlock(b: { startTime: string; endTime: string }): Block | null {
  const from = Math.max(toHour(b.startTime), START);
  const to = Math.min(toHour(b.endTime), END);
  if (to <= from) return null;
  return { left: ((from - START) / (END - START)) * 100, width: ((to - from) / (END - START)) * 100 };
}

type Props = {
  rooms: ScheduleRoom[];
  meId?: string;
  date: string;
  slot: { from: number; to: number } | null;
};

export default function RoomTimeline({ rooms, meId, date, slot }: Props) {
  // now เริ่มที่ null ทั้ง server และ client รอบแรก (ค่าตรงกันเสมอ) แล้วค่อยเซ็ตค่าจริงหลัง mount
  // เพื่อกัน hydration mismatch จาก new Date() ที่ต่างเวลากันระหว่าง server render กับ client hydrate
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const today = now ? `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` : '';
  const isToday = now !== null && date === today;
  const isPastDay = now !== null && date < today;

  const nowHour = now ? now.getHours() + now.getMinutes() / 60 : 0;
  const showNowLine = isToday && nowHour >= START && nowHour <= END;
  const nowLeft = ((nowHour - START) / (END - START)) * 100;

  const cellPassed = (h: number) => isPastDay || (isToday && h + 1 <= nowHour);
  const blockPassed = (b: { endTime: string }) => isPastDay || (isToday && toHour(b.endTime) <= nowHour);

  const passedWidth = isPastDay
    ? 100
    : isToday
      ? Math.max(0, Math.min(100, ((nowHour - START) / (END - START)) * 100))
      : 0;

  const band: Block | null = (() => {
    if (!slot) return null;
    const from = Math.max(slot.from, START);
    const to = Math.min(slot.to, END);
    if (to <= from) return null;
    return { left: ((from - START) / (END - START)) * 100, width: ((to - from) / (END - START)) * 100 };
  })();

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h3 className="mr-auto text-lg font-bold text-navy">Room Usage Schedule</h3>
        <span className="flex items-center gap-1.5 text-xs text-muted"><span className="h-3 w-3 rounded border border-line bg-white" /> Available</span>
        <span className="flex items-center gap-1.5 text-xs text-muted"><span className="h-3 w-3 rounded bg-rose-500" /> Booked</span>
        <span className="flex items-center gap-1.5 text-xs text-muted"><span className="h-3 w-3 rounded bg-amber-400" /> Yours</span>
        {passedWidth > 0 && <span className="flex items-center gap-1.5 text-xs text-muted"><span className="h-3 w-3 rounded bg-slate-300/60" /> Past</span>}
        {band && <span className="flex items-center gap-1.5 text-xs text-muted"><span className="h-3 w-3 rounded border border-blue/50 bg-blue/15" /> Selected range</span>}
        {showNowLine && now && <span className="flex items-center gap-1.5 text-xs text-muted"><span className="h-3 w-0.5 rounded bg-blue" /> Now ({pad(now.getHours())}:{pad(now.getMinutes())})</span>}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-160">
          <div className="flex">
            <div className="w-28 shrink-0" />
            <div className="grid flex-1 grid-cols-10 text-center text-xs text-muted">
              {HOURS.map((h) => <span key={h}>{pad(h)}:00</span>)}
            </div>
          </div>

          {rooms.map((room) => (
            <div className="mt-2 flex items-center" key={room.id}>
              <div className="w-28 shrink-0 pr-2 text-sm font-medium text-ink">{room.name}</div>
              <div className="relative h-10 flex-1">
                <div className="grid h-full grid-cols-10">
                  {HOURS.map((h) => (
                    <div className="flex items-center justify-center border border-dashed border-line" key={h}>
                      {!cellPassed(h) && <span className="text-[10px] text-slate-300">Free</span>}
                    </div>
                  ))}
                </div>
                {passedWidth > 0 && <div className="absolute inset-y-0 left-0 bg-slate-400/15" style={{ width: `${passedWidth}%` }} />}
                {band && <div className="absolute inset-y-0 rounded-md border-x-2 border-blue/50 bg-blue/15" style={{ left: `${band.left}%`, width: `${band.width}%` }} />}
                {room.bookings.map((b) => {
                  const pos = toBlock(b);
                  if (!pos) return null;
                  const mine = meId && b.userId === meId;
                  return (
                    <div
                      className={`absolute top-0.5 bottom-0.5 flex items-center overflow-hidden rounded-md px-2 ${mine ? 'bg-amber-400' : 'bg-rose-500'} ${blockPassed(b) ? 'opacity-40' : ''}`}
                      style={{ left: `${pos.left}%`, width: `${pos.width}%` }}
                      title={`${b.title} (${b.user?.name || ''})`}
                      key={b.id}
                    >
                      <span className={`truncate text-xs font-medium ${mine ? 'text-amber-950' : 'text-white'}`}>
                        {mine ? `Yours · ${b.title}` : b.title}
                      </span>
                    </div>
                  );
                })}
                {showNowLine && <div className="absolute inset-y-0 z-10 w-0.5 bg-blue shadow-[0_0_4px_rgba(30,95,168,.5)]" style={{ left: `${nowLeft}%` }} />}
              </div>
            </div>
          ))}

          {!rooms.length && <p className="mt-3 text-sm text-muted">No room data available</p>}
        </div>
      </div>
    </div>
  );
}
