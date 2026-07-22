import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อห้อง'),
  location: z.string().min(1, 'กรุณากรอกสถานที่'),
  capacity: z.coerce.number().int().min(1, 'จำนวนที่นั่งต้องมากกว่า 0'),
  equipment: z.array(z.string()).optional(),
});

export const updateRoomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1),
  capacity: z.coerce.number().int().min(1),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
