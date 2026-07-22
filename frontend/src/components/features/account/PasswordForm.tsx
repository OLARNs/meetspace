'use client';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/schemas/account.schema';
import { changePasswordAction } from '@/lib/actions/account.action';

const input = 'w-full rounded-lg border border-line bg-white p-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';
const label = 'mb-1 block text-sm font-medium text-ink';

export default function PasswordForm() {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<{ ok: string; error: string }>({ ok: '', error: '' });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  function onSubmit(v: ChangePasswordInput) {
    setNote({ ok: '', error: '' });
    startTransition(async () => {
      const res = await changePasswordAction(v);
      if (!res.success) return setNote({ ok: '', error: res.message });
      setNote({ ok: res.message ?? 'เปลี่ยนรหัสผ่านแล้ว', error: '' });
      reset({ currentPassword: '', newPassword: '', confirm: '' });
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <span className={label}>รหัสผ่านเดิม</span>
        <input className={input} type="password" placeholder="••••••••" {...register('currentPassword')} />
        {errors.currentPassword && <p className="mt-1 text-sm text-danger">{errors.currentPassword.message}</p>}
      </div>
      <div>
        <span className={label}>รหัสผ่านใหม่</span>
        <input className={input} type="password" placeholder="อย่างน้อย 8 ตัวอักษร" {...register('newPassword')} />
        {errors.newPassword && <p className="mt-1 text-sm text-danger">{errors.newPassword.message}</p>}
      </div>
      <div>
        <span className={label}>ยืนยันรหัสผ่านใหม่</span>
        <input className={input} type="password" placeholder="••••••••" {...register('confirm')} />
        {errors.confirm && <p className="mt-1 text-sm text-danger">{errors.confirm.message}</p>}
      </div>
      {note.error && <p className="text-sm text-danger">{note.error}</p>}
      {note.ok && <p className="text-sm font-medium text-emerald-600">✓ {note.ok}</p>}
      <button className="cursor-pointer self-start rounded-lg bg-blue px-4 py-2.5 font-medium text-white hover:bg-blue-dark disabled:opacity-60" type="submit" disabled={pending}>
        {pending ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
      </button>
    </form>
  );
}
