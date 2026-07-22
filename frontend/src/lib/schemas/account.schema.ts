import { z } from 'zod';

export const updateNameSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'กรุณากรอกรหัสผ่านเดิม'),
    newPassword: z.string().min(8, 'รหัสผ่านใหม่อย่างน้อย 8 ตัวอักษร'),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน',
    path: ['confirm'],
  });

export type UpdateNameInput = z.infer<typeof updateNameSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
