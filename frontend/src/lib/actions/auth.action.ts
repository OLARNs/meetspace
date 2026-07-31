'use server';
import { AuthError } from 'next-auth';
import { auth, signIn, signOut } from '@/lib/auth';
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
    if (error instanceof AuthError) return { success: false, message: 'Invalid email or password' };
    throw error;
  }
  return { success: true };
}

// เข้าสู่ระบบด้วย Google — signIn('google') จะเด้งไป Google แล้วกลับมาที่ /api/auth/callback/google
export async function googleLoginAction(): Promise<void> {
  await signIn('google', { redirectTo: '/' });
}

export async function logoutAction(): Promise<void> {
  // ล้าง refreshTokenHash ฝั่ง backend ก่อน (best-effort — token หมด/ล้มก็ยัง signOut ต่อได้)
  const session = await auth();
  const token = session?.user?.accessToken;
  if (token) {
    try {
      await AuthApi.logout(token);
    } catch {
      // เพิกเฉย: ถึง backend logout ไม่สำเร็จ ก็ยังต้องล้าง session ฝั่ง web
    }
  }
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
    if (error instanceof AuthError) return { success: false, message: 'Registered successfully, but automatic login failed. Please try logging in again.' };
    throw error;
  }
  return { success: true };
}
