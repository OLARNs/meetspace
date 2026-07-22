import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, RoomsModule, BookingsModule, UsersModule],
})
export class AppModule {}
