'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBookingAction } from '@/lib/actions/booking.action';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// ฟอร์มฝั่ง client รับ title/date/time แล้วประกอบเป็น ISO ส่งเข้า server action
const formSchema = z.object({
  title: z.string().min(1, 'Please enter a meeting title'),
  date: z.string().min(1, 'Please select a date'),
  startTime: z.string().min(1, 'Please select a start time'),
  endTime: z.string().min(1, 'Please select an end time'),
});
type FormInput = z.infer<typeof formSchema>;

type Props = { roomId: string; defaults: { date: string; startTime: string; endTime: string } };

export default function BookingForm({ roomId, defaults }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ error: string; ok: string }>({ error: '', ok: '' });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>({ resolver: zodResolver(formSchema), defaultValues: { title: '', ...defaults } });

  function onSubmit(v: FormInput) {
    setMsg({ error: '', ok: '' });
    startTransition(async () => {
      const res = await createBookingAction({
        roomId,
        title: v.title,
        startTime: new Date(`${v.date}T${v.startTime}`).toISOString(),
        endTime: new Date(`${v.date}T${v.endTime}`).toISOString(),
      });
      if (!res.success) {
        setMsg({ error: res.message, ok: '' });
        return;
      }
      setMsg({ error: '', ok: res.message ?? 'Booking successful!' });
      reset({ title: '', date: v.date, startTime: '', endTime: '' });
      router.refresh(); // ให้ตารางของห้อง (RSC) อัปเดต
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Meeting Title</Label>
        <Input id="title" className="h-10" placeholder="Sprint Planning Q3" {...register('title')} />
        {errors.title && <p className="text-sm text-danger">{errors.title.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date">Date</Label>
        <Input id="date" className="h-10" type="date" {...register('date')} />
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex min-w-28 flex-1 flex-col gap-1.5">
          <Label htmlFor="startTime">Start Time</Label>
          <Input id="startTime" className="h-10" type="time" {...register('startTime')} />
        </div>
        <div className="flex min-w-28 flex-1 flex-col gap-1.5">
          <Label htmlFor="endTime">End Time</Label>
          <Input id="endTime" className="h-10" type="time" {...register('endTime')} />
        </div>
      </div>
      {msg.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm">
          <p className="font-semibold text-rose-700">⚠️ Booking failed</p>
          <p className="mt-0.5 text-rose-600">{msg.error}</p>
        </div>
      )}
      {msg.ok && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
          ✓ {msg.ok} <Link className="underline hover:text-emerald-900" href="/my-bookings">View my bookings →</Link>
        </div>
      )}
      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? 'Booking...' : 'Confirm Booking'}
      </Button>
    </form>
  );
}
