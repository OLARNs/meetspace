'use server';
import { revalidatePath } from 'next/cache';
import { unstable_update } from '@/lib/auth';
import { UsersApi } from '@/lib/api/users.api';
import { ApiError } from '@/lib/api/api-error';
import {
  updateNameSchema,
  changePasswordSchema,
  type UpdateNameInput,
  type ChangePasswordInput,
} from '@/lib/schemas/account.schema';
import { firstZodError, type ActionResult } from './types';

export async function updateNameAction(input: UpdateNameInput): Promise<ActionResult> {
  const parsed = updateNameSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: firstZodError(parsed.error) };
  try {
    await UsersApi.updateMe({ name: parsed.data.name });
    // อัปเดตชื่อใน session ของ next-auth ให้ nav เปลี่ยนตามทันที (trigger 'update')
    await unstable_update({ user: { name: parsed.data.name } });
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
  revalidatePath('/account');
  return { success: true, message: 'Name saved' };
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: 'Please choose an image' };
  }
  try {
    await UsersApi.uploadAvatar(formData);
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
  revalidatePath('/account');
  return { success: true, message: 'Profile photo updated' };
}

export async function changePasswordAction(input: ChangePasswordInput): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: firstZodError(parsed.error) };
  try {
    await UsersApi.updateMe({
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
  return { success: true, message: 'Password changed' };
}
