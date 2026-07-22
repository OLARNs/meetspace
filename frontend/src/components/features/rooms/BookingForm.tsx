'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBookingAction } from '@/lib/actions/booking.action';
import { z } from 'zod';

const input = 'w-full rounded-lg border border-line bg-white p-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';
const label = 'mb-1 block text-sm font-medium text-ink';

// ฟอร์มฝั่ง client รับ title/date/time แล้วประกอบเป็น ISO ส่งเข้า server action
const formSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกหัวข้อการประชุม'),
  date: z.string().min(1, 'กรุณาเลือกวันที่'),
  startTime: z.string().min(1, 'กรุณาเลือกเวลาเริ่ม'),
  endTime: z.string().min(1, 'กรุณาเลือกเวลาสิ้นสุด'),
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
      setMsg({ error: '', ok: res.message ?? 'จองสำเร็จ!' });
      reset({ title: '', date: v.date, startTime: '', endTime: '' });
      router.refresh(); // ให้ตารางของห้อง (RSC) อัปเดต
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <span className={label}>หัวข้อการประชุม</span>
        <input className={input} placeholder="Sprint Planning Q3" {...register('title')} />
        {errors.title && <p className="mt-1 text-sm text-danger">{errors.title.message}</p>}
      </div>
      <div>
        <span className={label}>วันที่</span>
        <input className={input} type="date" {...register('date')} />
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="min-w-28 flex-1">
          <span className={label}>เวลาเริ่ม</span>
          <input className={input} type="time" {...register('startTime')} />
        </div>
        <div className="min-w-28 flex-1">
          <span className={label}>เวลาสิ้นสุด</span>
          <input className={input} type="time" {...register('endTime')} />
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
      <button
        className="cursor-pointer rounded-lg bg-blue px-4 py-2.5 font-medium text-white hover:bg-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? 'กำลังจอง...' : 'ยืนยันการจอง'}
      </button>
    </form>
  );
}
