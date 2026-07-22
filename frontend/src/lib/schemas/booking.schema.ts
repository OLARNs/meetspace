import { z } from 'zod';

export const createBookingSchema = z.object({
  roomId: z.string().min(1),
  title: z.string().min(1, 'กรุณากรอกหัวข้อการประชุม'),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

export const updateBookingSchema = z.object({
  id: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
