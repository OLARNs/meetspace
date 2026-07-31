import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // rate limiting กัน brute-force — default 10 req/นาที ต่อ IP (auth endpoint override ให้เข้มกว่านี้)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    PrismaModule,
    AuthModule,
    RoomsModule,
    BookingsModule,
    UsersModule,
  ],
})
export class AppModule {}
