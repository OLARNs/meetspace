import { z } from 'zod';

export const updateNameSchema = z.object({
  name: z.string().min(1, 'Please enter your name'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Please enter your current password'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: 'New passwords do not match',
    path: ['confirm'],
  });

export type UpdateNameInput = z.infer<typeof updateNameSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
