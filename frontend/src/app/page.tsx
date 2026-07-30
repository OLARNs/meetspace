import Link from 'next/link';
import { auth } from '@/lib/auth';
import { RoomsApi, type SearchParams } from '@/lib/api/rooms.api';
import SearchFilters from '@/components/features/rooms/SearchFilters';
import RoomTimeline from '@/components/features/rooms/RoomTimeline';

function todayStr() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

type SP = { [key: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : '');

export default async function HomePage({ searchParams }: { searchParams: SP }) {
  const date = one(searchParams.date) || todayStr();
  const keyword = one(searchParams.keyword);
  const minCapacity = one(searchParams.minCapacity);
  const startTime = one(searchParams.start);
  const endTime = one(searchParams.end);

  const search: SearchParams = {};
  if (keyword) search.keyword = keyword;
  if (minCapacity) search.minCapacity = minCapacity;
  const hasSlot = !!(date && startTime && endTime);
  if (hasSlot) {
    search.start = new Date(`${date}T${startTime}`).toISOString();
    search.end = new Date(`${date}T${endTime}`).toISOString();
  }

  const [rooms, schedule, session] = await Promise.all([
    RoomsApi.search(search),
    RoomsApi.schedule(date),
    auth(),
  ]);
  const meId = session?.user?.id;

  // สถานะว่าง: เลือกช่วงเวลาแล้วใช้ available จาก API, ไม่งั้นเช็ค "ตอนนี้" จาก timeline (เฉพาะวันนี้)
  const now = Date.now();
  const busyNow = new Set(
    schedule
      .filter((s) => s.bookings.some((b) => new Date(b.startTime).getTime() <= now && new Date(b.endTime).getTime() > now))
      .map((s) => s.id)
  );
  const isFree = (r: (typeof rooms)[number]): boolean | null => {
    if (r.available !== undefined) return r.available;
    if (date === todayStr()) return !busyNow.has(r.id);
    return null;
  };

  const slotQuery = hasSlot ? `?date=${date}&start=${startTime}&end=${endTime}` : '';
  const visibleSchedule = schedule.filter((s) => rooms.some((r) => r.id === s.id));
  const toHour = (t: string) => Number(t.slice(0, 2)) + Number(t.slice(3, 5)) / 60;
  const slot = hasSlot ? { from: toHour(startTime), to: toHour(endTime) } : null;
  const freeCount = rooms.filter((r) => isFree(r) === true).length;

  return (
    <>
      <h1 className="text-3xl font-bold text-navy">Book a Meeting Room</h1>
      <p className="mt-1 mb-5 text-muted">Find and book an available meeting room for your team</p>

      <SearchFilters defaults={{ date, keyword, minCapacity, start: startTime, end: endTime }} />

      <div className="mb-6">
        <p className="mb-2 text-sm text-muted">{new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
        <RoomTimeline rooms={visibleSchedule} meId={meId} date={date} slot={slot} />
      </div>

      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold text-navy">All Meeting Rooms</h3>
        {hasSlot ? (
          <span className="text-sm text-muted">{freeCount} of {rooms.length} rooms available · {startTime}–{endTime}</span>
        ) : (
          <span className="text-sm text-muted">Select a start–end time above to check room availability</span>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {rooms.map((r) => {
          const free = isFree(r);
          return (
            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm" key={r.id}>
              <div className="flex items-start justify-between gap-2 bg-navy p-4">
                <div>
                  <p className="text-[11px] font-medium tracking-widest text-slate-400 uppercase">{r.location}</p>
                  <p className="text-lg font-bold text-white">{r.name}</p>
                </div>
                {free !== null && (
                  <span className={`flex items-center gap-1.5 text-sm ${free ? 'text-teal-300' : 'text-rose-400'}`}>
                    <span className={`h-2 w-2 rounded-full ${free ? 'bg-teal-300' : 'bg-rose-400'}`} />
                    {free ? 'Available' : 'Busy'}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="mb-3 text-sm text-muted">👥 {r.capacity} seats · {(r.equipment || []).join(' · ')}</p>
                <Link className="mt-auto block rounded-lg bg-blue px-4 py-2.5 text-center font-medium text-white hover:bg-blue-dark" href={`/rooms/${r.id}${slotQuery}`}>
                  Details / Book
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {!rooms.length && <p className="text-sm text-muted">No rooms match the current filters</p>}
    </>
  );
}
