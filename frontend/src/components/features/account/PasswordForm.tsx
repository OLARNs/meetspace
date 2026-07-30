'use client';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/schemas/account.schema';
import { changePasswordAction } from '@/lib/actions/account.action';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
      setNote({ ok: res.message ?? 'Password changed', error: '' });
      reset({ currentPassword: '', newPassword: '', confirm: '' });
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input id="currentPassword" className="h-10" type="password" placeholder="••••••••" {...register('currentPassword')} />
        {errors.currentPassword && <p className="text-sm text-danger">{errors.currentPassword.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">New Password</Label>
        <Input id="newPassword" className="h-10" type="password" placeholder="At least 8 characters" {...register('newPassword')} />
        {errors.newPassword && <p className="text-sm text-danger">{errors.newPassword.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm">Confirm New Password</Label>
        <Input id="confirm" className="h-10" type="password" placeholder="••••••••" {...register('confirm')} />
        {errors.confirm && <p className="text-sm text-danger">{errors.confirm.message}</p>}
      </div>
      {note.error && <p className="text-sm text-danger">{note.error}</p>}
      {note.ok && <p className="text-sm font-medium text-emerald-600">✓ {note.ok}</p>}
      <Button type="submit" className="h-10 self-start" disabled={pending}>
        {pending ? 'Changing...' : 'Change Password'}
      </Button>
    </form>
  );
}
