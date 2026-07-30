'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createRoomAction } from '@/lib/actions/room.action';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
      <div className="flex min-w-40 flex-2 flex-col gap-1.5">
        <Label htmlFor="room-name">Room Name</Label>
        <Input id="room-name" className="h-10" placeholder="Conference Room C" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="flex min-w-28 flex-1 flex-col gap-1.5">
        <Label htmlFor="room-location">Location</Label>
        <Input id="room-location" className="h-10" placeholder="Floor 3" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      </div>
      <div className="flex min-w-24 flex-1 flex-col gap-1.5">
        <Label htmlFor="room-capacity">Capacity</Label>
        <Input id="room-capacity" className="h-10" type="number" min="1" placeholder="10" required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
      </div>
      <div className="flex min-w-40 flex-2 flex-col gap-1.5">
        <Label htmlFor="room-equipment">Equipment (comma-separated)</Label>
        <Input id="room-equipment" className="h-10" placeholder="Projector, TV" value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} />
      </div>
      <Button type="submit" className="h-10" disabled={pending}>+ Add Room</Button>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </form>
  );
}
