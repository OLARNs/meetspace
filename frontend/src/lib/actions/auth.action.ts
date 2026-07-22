'use server';
import { AuthError } from 'next-auth';
import { signIn, signOut } from '@/lib/auth';
import { AuthApi } from '@/lib/api/auth.api';
import { ApiError } from '@/lib/api/api-error';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@/lib/schemas/auth.schema';
import { firstZodError, type ActionResult } from './types';

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: firstZodError(parsed.error) };
  try {
    // redirect:false เพื่อให้ client จัดการ navigate เอง (จะได้ refresh nav ด้วย)
    await signIn('credentials', { ...parsed.data, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) return { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    throw error;
  }
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/login' });
}

export async function registerAction(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: firstZodError(parsed.error) };
  const { name, email, password } = parsed.data;
  try {
    await AuthApi.register({ name, email, password });
    // สมัครเสร็จ ล็อกอินให้เลย
    await signIn('credentials', { email, password, redirect: false });
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    if (error instanceof AuthError) return { success: false, message: 'สมัครสำเร็จ แต่เข้าสู่ระบบอัตโนมัติไม่ได้ ลองล็อกอินอีกครั้ง' };
    throw error;
  }
  return { success: true };
}
