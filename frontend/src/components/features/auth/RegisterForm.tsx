'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/schemas/auth.schema';
import { registerAction } from '@/lib/actions/auth.action';

const input = 'w-full rounded-lg border border-line bg-white p-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';
const label = 'mb-1 block text-sm font-medium text-ink';

export default function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rootError, setRootError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  function onSubmit(values: RegisterInput) {
    setRootError('');
    startTransition(async () => {
      const res = await registerAction(values);
      if (!res.success) {
        setRootError(res.message);
        return;
      }
      router.push('/');
      router.refresh();
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <span className={label}>ชื่อ-นามสกุล</span>
        <input className={input} placeholder="สมชาย ใจดี" {...register('name')} />
        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name.message}</p>}
      </div>
      <div>
        <span className={label}>อีเมล</span>
        <input className={input} type="email" placeholder="you@company.com" {...register('email')} />
        {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
      </div>
      <div>
        <span className={label}>รหัสผ่าน</span>
        <input className={input} type="password" placeholder="อย่างน้อย 8 ตัวอักษร" {...register('password')} />
        {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
      </div>
      <div>
        <span className={label}>ยืนยันรหัสผ่าน</span>
        <input className={input} type="password" placeholder="••••••••" {...register('confirm')} />
        {errors.confirm && <p className="mt-1 text-sm text-danger">{errors.confirm.message}</p>}
      </div>
      {rootError && <p className="text-sm text-danger">{rootError}</p>}
      <button
        className="cursor-pointer rounded-lg bg-blue px-4 py-2.5 font-medium text-white hover:bg-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
      </button>
    </form>
  );
}
