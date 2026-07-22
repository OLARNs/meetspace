'use client';

// ตาราง timeline การใช้ห้องรายวัน (08:00–18:00)
// rooms มาจาก GET /rooms/schedule?date=... — แต่ละห้องมี bookings ของวันนั้น
// meId = id ผู้ใช้ที่ล็อกอิน ใช้แยกสี "ของคุณ" (เหลือง) ออกจากของคนอื่น (แดง)
// date = วันที่กำลังดู (YYYY-MM-DD) ใช้คำนวณเส้น "ตอนนี้" และช่วงเวลาที่ผ่านไปแล้ว
const START = 8;
const END = 18;
const HOURS = Array.from({ length: END - START }, (_, i) => START + i);

const toHour = (d) => new Date(d).getHours() + new Date(d).getMinutes() / 60;

// แปลงช่วงเวลาจองเป็นตำแหน่ง % บนแถบ 08:00–18:00 (ตัดส่วนที่ล้นออก)
function toBlock(b) {
  const from = Math.max(toHour(b.startTime), START);
  const to = Math.min(toHour(b.endTime), END);
  if (to <= from) return null;
  return {
    left: ((from - START) / (END - START)) * 100,
    width: ((to - from) / (END - START)) * 100
  };
}

export default function RoomTimeline({ rooms, meId, date, slot }) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const isToday = date === today;
  const isPastDay = date < today; // เทียบ string YYYY-MM-DD ได้ตรง ๆ

  const nowHour = now.getHours() + now.getMinutes() / 60;
  const showNowLine = isToday && nowHour >= START && nowHour <= END;
  const nowLeft = ((nowHour - START) / (END - START)) * 100;

  // ช่อง/บล็อกที่จบไปแล้ว → ไม่ขึ้นคำว่า "ว่าง" / จางลง (จองย้อนหลังไม่ได้)
  const cellPassed = (h) => isPastDay || (isToday && h + 1 <= nowHour);
  const blockPassed = (b) => isPastDay || (isToday && toHour(b.endTime) <= nowHour);

  // แถบเทาทับช่วงที่ผ่านไปแล้ว: ตั้งแต่ 08:00 ถึงเวลาตอนนี้เป๊ะ ๆ (ทั้งวันถ้าดูวันที่ผ่านมาแล้ว)
  const passedWidth = isPastDay
    ? 100
    : isToday
      ? Math.max(0, Math.min(100, ((nowHour - START) / (END - START)) * 100))
      : 0;

  // แถบไฮไลต์ช่วงเวลาที่เลือกจากตัวกรอง (ถ้าเลือกครบเริ่ม–สิ้นสุด)
  const band = (() => {
    if (!slot) return null;
    const from = Math.max(slot.from, START);
    const to = Math.min(slot.to, END);
    if (to <= from) return null;
    return { left: ((from - START) / (END - START)) * 100, width: ((to - from) / (END - START)) * 100 };
  })();

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h3 className="mr-auto text-lg font-bold text-navy">ตารางการใช้ห้อง</h3>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-3 w-3 rounded border border-line bg-white" /> ว่าง
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-3 w-3 rounded bg-rose-500" /> จองแล้ว
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-3 w-3 rounded bg-amber-400" /> ของคุณ
        </span>
        {passedWidth > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-3 w-3 rounded bg-slate-300/60" /> ผ่านไปแล้ว
          </span>
        )}
        {band && (
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-3 w-3 rounded border border-blue/50 bg-blue/15" /> ช่วงที่เลือก
          </span>
        )}
        {showNowLine && (
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-3 w-0.5 rounded bg-blue" /> ตอนนี้ ({pad(now.getHours())}:{pad(now.getMinutes())})
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-160">
          {/* หัวตาราง: ชั่วโมง 08:00–17:00 */}
          <div className="flex">
            <div className="w-28 shrink-0" />
            <div className="grid flex-1 grid-cols-10 text-center text-xs text-muted">
              {HOURS.map((h) => <span key={h}>{String(h).padStart(2, '0')}:00</span>)}
            </div>
          </div>

          {rooms.map((room) => (
            <div className="mt-2 flex items-center" key={room.id}>
              <div className="w-28 shrink-0 pr-2 text-sm font-medium text-ink">{room.name}</div>
              <div className="relative h-10 flex-1">
                {/* ช่องพื้นหลังรายชั่วโมง (คำว่า "ว่าง" ขึ้นเฉพาะช่องที่ยังไม่ผ่านเวลา) */}
                <div className="grid h-full grid-cols-10">
                  {HOURS.map((h) => (
                    <div className="flex items-center justify-center border border-dashed border-line" key={h}>
                      {!cellPassed(h) && <span className="text-[10px] text-slate-300">ว่าง</span>}
                    </div>
                  ))}
                </div>
                {/* แถบเทาทับช่วงที่ผ่านไปแล้ว (แม่นระดับนาที ชนขอบเส้น "ตอนนี้" พอดี) */}
                {passedWidth > 0 && (
                  <div className="absolute inset-y-0 left-0 bg-slate-400/15" style={{ width: `${passedWidth}%` }} />
                )}
                {/* แถบช่วงเวลาที่เลือก (อยู่ใต้บล็อกการจอง เห็นชัดว่าชนกันตรงไหน) */}
                {band && (
                  <div
                    className="absolute inset-y-0 rounded-md border-x-2 border-blue/50 bg-blue/15"
                    style={{ left: `${band.left}%`, width: `${band.width}%` }}
                  />
                )}
                {/* บล็อกการจองวางทับตามตำแหน่งเวลา */}
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
                        {mine ? `ของคุณ · ${b.title}` : b.title}
                      </span>
                    </div>
                  );
                })}
                {/* เส้นบอกเวลาปัจจุบัน (เฉพาะวันนี้) */}
                {showNowLine && (
                  <div className="absolute inset-y-0 z-10 w-0.5 bg-blue shadow-[0_0_4px_rgba(30,95,168,.5)]" style={{ left: `${nowLeft}%` }} />
                )}
              </div>
            </div>
          ))}

          {!rooms.length && <p className="mt-3 text-sm text-muted">ไม่มีข้อมูลห้อง</p>}
        </div>
      </div>
    </div>
  );
}
