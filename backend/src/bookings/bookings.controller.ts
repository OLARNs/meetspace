import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private bookings: BookingsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateBookingDto) {
    return this.bookings.create(req.user.userId, dto);
  }

  @Get('me')
  myBookings(@Req() req) {
    return this.bookings.findByUser(req.user.userId);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookings.update(req.user, id, dto);
  }

  @Delete(':id')
  cancel(@Req() req, @Param('id') id: string) {
    return this.bookings.cancel(req.user, id);
  }

  // Admin ดูการจองทั้งหมด
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.bookings.findAll();
  }
}
