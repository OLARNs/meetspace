import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto, SearchRoomsDto } from './dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async search(q: SearchRoomsDto) {
    const rooms = await this.prisma.room.findMany({
      where: {
        // ปกติเห็นเฉพาะห้องที่เปิดใช้งาน ยกเว้นหน้า admin ส่ง all=true มาขอดูทั้งหมด
        ...(q.all === 'true' ? {} : { isActive: true }),
        ...(q.keyword ? { name: { contains: q.keyword, mode: 'insensitive' } } : {}),
        ...(q.minCapacity ? { capacity: { gte: Number(q.minCapacity) } } : {}),
        ...(q.equipment ? { equipment: { has: q.equipment } } : {}),
      },
      orderBy: { name: 'asc' },
    });

    // ถ้าระบุช่วงเวลา ให้เช็คว่าห้องไหนว่าง
    if (q.start && q.end) {
      const start = new Date(q.start);
      const end = new Date(q.end);
      const busy = await this.prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          startTime: { lt: end },
          endTime: { gt: start },
        },
        select: { roomId: true },
      });
      const busyIds = new Set(busy.map((b) => b.roomId));
      return rooms.map((r) => ({ ...r, available: !busyIds.has(r.id) }));
    }
    return rooms;
  }

  /** ตารางการใช้ห้องของทุกห้องในวันที่ระบุ (ใช้วาด timeline หน้าแรก) */
  async schedule(date?: string) {
    const dayStart = date ? new Date(`${date}T00:00:00`) : new Date(new Date().setHours(0, 0, 0, 0));
    if (isNaN(dayStart.getTime())) throw new BadRequestException('Invalid date format (YYYY-MM-DD)');
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    return this.prisma.room.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        bookings: {
          where: { status: 'CONFIRMED', startTime: { lt: dayEnd }, endTime: { gt: dayStart } },
          orderBy: { startTime: 'asc' },
          select: { id: true, title: true, startTime: true, endTime: true, userId: true, user: { select: { name: true } } },
        },
      },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: 'CONFIRMED', endTime: { gte: new Date() } },
          orderBy: { startTime: 'asc' },
          select: { id: true, title: true, startTime: true, endTime: true, user: { select: { name: true } } },
        },
      },
    });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  create(dto: CreateRoomDto) {
    return this.prisma.room.create({ data: dto });
  }

  async update(id: string, dto: UpdateRoomDto) {
    await this.findOne(id);
    return this.prisma.room.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    // soft delete: ปิดการใช้งานแทนการลบจริง เพื่อรักษาประวัติการจอง
    return this.prisma.room.update({ where: { id }, data: { isActive: false } });
  }
}
