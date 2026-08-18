import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

// เลือกเฉพาะฟิลด์ที่ปลอดภัยจะส่งกลับให้ frontend — ไม่มี password ปนมาเด็ดขาด
const SAFE_SELECT = { id: true, name: true, email: true, role: true, createdAt: true, avatarUrl: true };

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { ...SAFE_SELECT, password: true },
    });
    if (!user) throw new NotFoundException('User not found');
    // ไม่ส่ง password ออกไป — ส่งแค่ธง hasPassword ให้ frontend ซ่อนฟอร์มเปลี่ยนรหัสของ Google user
    const { password, ...rest } = user;
    return { ...rest, hasPassword: password !== null };
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const data: { name?: string; password?: string; refreshTokenHash?: null } = {};

    if (dto.name) data.name = dto.name;

    // เปลี่ยนรหัสผ่านเป็นเรื่องแยก: ต้องยืนยันตัวตนด้วยรหัสเดิมก่อนเสมอ
    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password is required to change your password');
      }
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      // บัญชี Google ล้วน (ไม่มีรหัสผ่าน) เปลี่ยนรหัสไม่ได้
      if (!user.password) {
        throw new BadRequestException('This account uses Google sign-in and has no password to change');
      }
      const match = await bcrypt.compare(dto.currentPassword, user.password);
      if (!match) throw new UnauthorizedException('Current password is incorrect');
      data.password = await bcrypt.hash(dto.newPassword, 10);
      // เปลี่ยนรหัสแล้วเพิกถอน session เดิมทุกเครื่อง (เผื่อรหัสถูกขโมย) — refresh ใบเก่าใช้ไม่ได้อีก
      data.refreshTokenHash = null;
    }

    const updated = await this.prisma.user.update({ where: { id: userId }, data, select: SAFE_SELECT });
    return updated;
  }

  // อัปโหลดรูปโปรไฟล์ขึ้น Cloudinary แล้วเก็บ URL — cloudinary อ่าน CLOUDINARY_URL จาก env อัตโนมัติ
  async setAvatar(userId: string, file: Express.Multer.File) {
    const url = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'meetspace/avatars', resource_type: 'image' },
          (err, result) => (err || !result ? reject(err ?? new Error('Upload failed')) : resolve(result.secure_url)),
        )
        .end(file.buffer);
    });
    return this.prisma.user.update({ where: { id: userId }, data: { avatarUrl: url }, select: SAFE_SELECT });
  }
}
