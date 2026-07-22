// ผลลัพธ์มาตรฐานของ Server Action — client อ่าน success เพื่อตัดสินใจแสดงผล
export type ActionResult =
  | { success: true; message?: string }
  | { success: false; message: string };

// ดึงข้อความ error แรกจาก zod มาโชว์
import type { z } from 'zod';
export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง';
}
