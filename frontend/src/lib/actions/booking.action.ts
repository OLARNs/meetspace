'use server';
import { revalidatePath } from 'next/cache';
import { BookingsApi } from '@/lib/api/bookings.api';
import { ApiError } from '@/lib/api/api-error';
import {
  createBookingSchema,
  updateBookingSchema,
  type CreateBookingInput,
  type UpdateBookingInput,
} from '@/lib/schemas/booking.schema';
import { firstZodError, type ActionResult } from './types';

export async function createBookingAction(input: CreateBookingInput): Promise<ActionResult> {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: firstZodError(parsed.error) };
  try {
    await BookingsApi.create(parsed.data);
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
  revalidatePath('/');
  revalidatePath(`/rooms/${parsed.data.roomId}`);
  revalidatePath('/my-bookings');
  return { success: true, message: 'จองสำเร็จ!' };
}

export async function updateBookingAction(input: UpdateBookingInput): Promise<ActionResult> {
  const parsed = updateBookingSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: firstZodError(parsed.error) };
  const { id, ...data } = parsed.data;
  try {
    await BookingsApi.update(id, data);
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
  revalidatePath('/my-bookings');
  revalidatePath('/');
  return { success: true, message: 'แก้ไขการจองแล้ว' };
}

export async function cancelBookingAction(id: string): Promise<ActionResult> {
  try {
    await BookingsApi.cancel(id);
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
  revalidatePath('/my-bookings');
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}
