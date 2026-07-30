import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto, UpdateBookingDto } from "./dto/booking.dto";

type ReqUser = { userId: string; role: string };

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  /** เช็คความถูกต้องของช่วงเวลา + การจองซ้อน **/
  private async assertNoOverlap(
    roomId: string,
    start: Date,
    end: Date,
    excludeId?: string,
  ) {
    if (end <= start)
      throw new BadRequestException("End time must be after start time");
    if (start < new Date())
      throw new BadRequestException("Cannot book a time in the past");
    const overlap = await this.prisma.booking.findFirst({
      where: {
        roomId,
        status: "CONFIRMED",
        startTime: { lt: end },
        endTime: { gt: start },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (overlap)
      throw new ConflictException(
        "This room is already booked for the selected time range",
      );
  }

  async create(userId: string, dto: CreateBookingDto) {
    const room = await this.prisma.room.findFirst({
      where: { id: dto.roomId, isActive: true },
    });
    if (!room) throw new NotFoundException("Room not found");
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    await this.assertNoOverlap(dto.roomId, start, end);
    return this.prisma.booking.create({
      data: {
        roomId: dto.roomId,
        userId,
        title: dto.title,
        startTime: start,
        endTime: end,
      },
      include: { room: true },
    });
  }

  findByUser(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: { room: true },
      orderBy: { startTime: "desc" },
    });
  }

  findAll() {
    return this.prisma.booking.findMany({
      include: {
        room: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startTime: "desc" },
    });
  }

  private async getOwned(user: ReqUser, id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException("Booking not found");
    if (user.role !== "ADMIN" && booking.userId !== user.userId) {
      throw new ForbiddenException(
        "You do not have permission to manage this booking",
      );
    }
    return booking;
  }

  async update(user: ReqUser, id: string, dto: UpdateBookingDto) {
    const booking = await this.getOwned(user, id);
    const start = dto.startTime ? new Date(dto.startTime) : booking.startTime;
    const end = dto.endTime ? new Date(dto.endTime) : booking.endTime;
    await this.assertNoOverlap(booking.roomId, start, end, id);
    return this.prisma.booking.update({
      where: { id },
      data: {
        title: dto.title ?? booking.title,
        startTime: start,
        endTime: end,
      },
      include: { room: true },
    });
  }

  async cancel(user: ReqUser, id: string) {
    await this.getOwned(user, id);
    return this.prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }
}
