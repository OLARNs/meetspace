'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateNameSchema, type UpdateNameInput } from '@/lib/schemas/account.schema';
import { updateNameAction } from '@/lib/actions/account.action';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
      setNote({ ok: res.message ?? 'Saved', error: '' });
      router.refresh(); // อัปเดต nav (ชื่อใหม่)
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" className="h-10 bg-mist text-muted" value={email} disabled readOnly />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" className="h-10" {...register('name')} />
        {errors.name && <p className="text-sm text-danger">{errors.name.message}</p>}
      </div>
      {note.error && <p className="text-sm text-danger">{note.error}</p>}
      {note.ok && <p className="text-sm font-medium text-emerald-600">✓ {note.ok}</p>}
      <Button type="submit" className="h-10 self-start" disabled={pending}>
        {pending ? 'Saving...' : 'Save Name'}
      </Button>
    </form>
  );
}
