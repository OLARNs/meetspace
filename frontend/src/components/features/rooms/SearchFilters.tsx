'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

const input = 'w-full rounded-lg border border-line bg-white p-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';
const label = 'mb-1 block text-sm font-medium text-ink';

// ตัวกรองแบบ URL-driven: เปลี่ยนค่า → อัปเดต query string → RSC หน้าแรก re-fetch เอง
export default function SearchFilters({ defaults }: { defaults: { date: string; keyword: string; minCapacity: string; start: string; end: string } }) {
  const router = useRouter();
  const params = useSearchParams();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function push(patch: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.replace(`/?${next.toString()}`, { scroll: false });
  }

  // ช่องพิมพ์ (ชื่อห้อง/ที่นั่ง) หน่วง 300ms กันยิงถี่
  function pushDebounced(patch: Record<string, string>) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push(patch), 300);
  }

  return (
    <div className="mb-5 rounded-xl border border-line bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-navy">ค้นหาห้องว่าง</h3>
      <div className="flex flex-wrap gap-3">
        <div className="min-w-52 flex-2">
          <span className={label}>ชื่อห้องประชุม</span>
          <input className={input} defaultValue={defaults.keyword} placeholder="เช่น Room A, Board Room..." onChange={(e) => pushDebounced({ keyword: e.target.value })} />
        </div>
        <div className="min-w-24 flex-1">
          <span className={label}>ที่นั่งขั้นต่ำ</span>
          <input className={input} type="number" min="1" defaultValue={defaults.minCapacity} placeholder="ไม่ระบุ" onChange={(e) => pushDebounced({ minCapacity: e.target.value })} />
        </div>
        <div className="min-w-35 flex-1">
          <span className={label}>วันที่</span>
          <input className={input} type="date" defaultValue={defaults.date} onChange={(e) => push({ date: e.target.value })} />
        </div>
        <div className="min-w-28 flex-1">
          <span className={label}>เวลาเริ่ม</span>
          <input className={input} type="time" defaultValue={defaults.start} onChange={(e) => push({ start: e.target.value })} />
        </div>
        <div className="min-w-28 flex-1">
          <span className={label}>เวลาสิ้นสุด</span>
          <input className={input} type="time" defaultValue={defaults.end} onChange={(e) => push({ end: e.target.value })} />
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">
        เลือกวันและช่วงเวลาที่จะประชุม ผลด้านล่างอัพเดตทันที — ชื่อห้องกับที่นั่งเว้นว่างได้ (= เอาทุกห้อง)
      </p>
    </div>
  );
}
