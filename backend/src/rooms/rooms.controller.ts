import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto, SearchRoomsDto } from './dto/room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';

@Controller('rooms')
export class RoomsController {
  constructor(private rooms: RoomsService) {}

  // ค้นหาห้อง + กรองตามวัน/เวลา/ที่นั่ง (ทุกคนดูได้)
  @Get()
  search(@Query() query: SearchRoomsDto) {
    return this.rooms.search(query);
  }

  // ตารางการใช้ห้องรายวันของทุกห้อง — ต้องประกาศก่อน :id ไม่งั้น 'schedule' จะโดนจับเป็น id
  @Get('schedule')
  schedule(@Query('date') date?: string) {
    return this.rooms.schedule(date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rooms.findOne(id);
  }

  // ===== Admin เท่านั้น =====
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.rooms.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.rooms.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rooms.remove(id);
  }
}
