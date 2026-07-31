import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto, RefreshDto } from "./dto/auth.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

// throttle ทุก endpoint ของ auth กัน brute-force (login/register เข้ม, refresh ผ่อนกว่า)
@UseGuards(ThrottlerGuard)
@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  // เข้มสุด — จุดที่โดนเดารหัสผ่านรัว ๆ: 5 ครั้ง/นาที ต่อ IP
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  // public — access token หมดแล้ว แนบ Bearer ไม่ได้ จึงส่ง refresh token มาทาง body แทน
  // ผ่อนกว่า (30/นาที) เพราะเป็น operation ปกติของ silent refresh + refresh token เดายากอยู่แล้ว
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post("refresh")
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  // ต้องมี access token ที่ยัง valid ถึงจะ logout ได้ (รู้ว่า userId ไหน)
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  logout(@Req() req) {
    return this.auth.logout(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req) {
    return req.user;
  }
}
