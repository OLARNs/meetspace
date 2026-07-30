'use server';
import { revalidatePath } from 'next/cache';
import { RoomsApi } from '@/lib/api/rooms.api';
import { ApiError } from '@/lib/api/api-error';
import {
  createRoomSchema,
  updateRoomSchema,
  type CreateRoomInput,
  type UpdateRoomInput,
} from '@/lib/schemas/room.schema';
import { firstZodError, type ActionResult } from './types';

export async function createRoomAction(input: CreateRoomInput): Promise<ActionResult> {
  const parsed = createRoomSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: firstZodError(parsed.error) };
  try {
    await RoomsApi.create({ ...parsed.data, equipment: parsed.data.equipment ?? [] });
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true, message: 'Room added' };
}

export async function updateRoomAction(input: UpdateRoomInput): Promise<ActionResult> {
  const parsed = updateRoomSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: firstZodError(parsed.error) };
  const { id, ...data } = parsed.data;
  try {
    await RoomsApi.update(id, data);
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true, message: 'Room updated' };
}

// เปิด/ปิดใช้งานห้อง: ปิด = soft delete (DELETE), เปิดคืน = PATCH isActive=true
export async function setRoomActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    if (isActive) await RoomsApi.update(id, { isActive: true });
    else await RoomsApi.remove(id);
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}
