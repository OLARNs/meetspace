'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createRoomAction } from '@/lib/actions/room.action';

const input = 'w-full rounded-lg border border-line bg-white p-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';
const label = 'mb-1 block text-sm font-medium text-ink';

export default function AddRoomForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: '', location: '', capacity: '', equipment: '' });
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const res = await createRoomAction({
        name: form.name,
        location: form.location,
        capacity: Number(form.capacity),
        equipment: form.equipment.split(',').map((s) => s.trim()).filter(Boolean),
      });
      if (!res.success) return setError(res.message);
      setForm({ name: '', location: '', capacity: '', equipment: '' });
      router.refresh();
    });
  }

  return (
    <form className="flex flex-wrap items-end gap-3" onSubmit={submit}>
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
      <button className="cursor-pointer rounded-lg bg-blue px-4 py-2.5 font-medium text-white hover:bg-blue-dark disabled:opacity-60" type="submit" disabled={pending}>+ เพิ่มห้อง</button>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </form>
  );
}
