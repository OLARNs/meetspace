'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateNameSchema, type UpdateNameInput } from '@/lib/schemas/account.schema';
import { updateNameAction } from '@/lib/actions/account.action';

const input = 'w-full rounded-lg border border-line bg-white p-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';
const label = 'mb-1 block text-sm font-medium text-ink';

export default function ProfileForm({ defaultName, email }: { defaultName: string; email: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<{ ok: string; error: string }>({ ok: '', error: '' });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateNameInput>({ resolver: zodResolver(updateNameSchema), defaultValues: { name: defaultName } });

  function onSubmit(v: UpdateNameInput) {
    setNote({ ok: '', error: '' });
    startTransition(async () => {
      const res = await updateNameAction(v);
      if (!res.success) return setNote({ ok: '', error: res.message });
      setNote({ ok: res.message ?? 'บันทึกแล้ว', error: '' });
      router.refresh(); // อัปเดต nav (ชื่อใหม่)
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <span className={label}>อีเมล</span>
        <input className={`${input} bg-mist text-muted`} value={email} disabled readOnly />
      </div>
      <div>
        <span className={label}>ชื่อ-นามสกุล</span>
        <input className={input} {...register('name')} />
        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name.message}</p>}
      </div>
      {note.error && <p className="text-sm text-danger">{note.error}</p>}
      {note.ok && <p className="text-sm font-medium text-emerald-600">✓ {note.ok}</p>}
      <button className="cursor-pointer self-start rounded-lg bg-blue px-4 py-2.5 font-medium text-white hover:bg-blue-dark disabled:opacity-60" type="submit" disabled={pending}>
        {pending ? 'กำลังบันทึก...' : 'บันทึกชื่อ'}
      </button>
    </form>
  );
}
