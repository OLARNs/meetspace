import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, 'กรุณากรอกชื่อ'),
    email: z.email('อีเมลไม่ถูกต้อง'),
    password: z.string().min(8, 'รหัสผ่านอย่างน้อย 8 ตัวอักษร'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'รหัสผ่านทั้งสองช่องไม่ตรงกัน',
    path: ['confirm'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
