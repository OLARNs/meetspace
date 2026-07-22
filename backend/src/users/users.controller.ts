import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@Req() req) {
    return this.users.me(req.user.userId);
  }

  @Patch('me')
  updateMe(@Req() req, @Body() dto: UpdateMeDto) {
    return this.users.updateMe(req.user.userId, dto);
  }
}
