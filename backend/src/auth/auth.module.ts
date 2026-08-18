import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      // ไม่ตั้ง default expiresIn ที่นี่ — ไม่งั้น refresh token จะติดค่านี้ไปด้วย
      // access ตั้ง 15m ตอนเซ็น (signAccess), refresh ไม่ตั้งเลย = ไม่หมดอายุ
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
