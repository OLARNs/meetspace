import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

// เลือกเฉพาะฟิลด์ที่ปลอดภัยจะส่งกลับให้ frontend — ไม่มี password ปนมาเด็ดขาด
const SAFE_SELECT = { id: true, name: true, email: true, role: true, createdAt: true };

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: SAFE_SELECT });
    if (!user) throw new NotFoundException('User not found');
    return user;
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
      const match = await bcrypt.compare(dto.currentPassword, user.password);
      if (!match) throw new UnauthorizedException('Current password is incorrect');
      data.password = await bcrypt.hash(dto.newPassword, 10);
      // เปลี่ยนรหัสแล้วเพิกถอน session เดิมทุกเครื่อง (เผื่อรหัสถูกขโมย) — refresh ใบเก่าใช้ไม่ได้อีก
      data.refreshTokenHash = null;
    }

    const updated = await this.prisma.user.update({ where: { id: userId }, data, select: SAFE_SELECT });
    return updated;
  }
}
