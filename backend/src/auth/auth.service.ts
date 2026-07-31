import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, timingSafeEqual } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  // ตัว verify id_token ของ Google (ตรวจลายเซ็นของ Google เอง ปลอมไม่ได้)
  private googleClient = new OAuth2Client();

  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('This email is already in use');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hash },
    });
    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // !user.password = บัญชี Google ล้วน (ไม่มีรหัสผ่าน) → ตอบ 401 ปกติ ไม่ให้ bcrypt.compare(x, null) throw เป็น 500
    if (!user || !user.password || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueTokens(user);
  }

  // login ด้วย Google: frontend ส่ง id_token มา → verify กับ Google → find-or-create → ออก token ชุดเดิม
  async googleLogin(idToken: string) {
    let email: string | undefined;
    let name: string | undefined;
    let googleId: string | undefined;
    let emailVerified: boolean | undefined;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID, // กันเอา token ของแอปอื่นมาใช้
      });
      const payload = ticket.getPayload();
      email = payload?.email;
      name = payload?.name;
      googleId = payload?.sub;
      emailVerified = payload?.email_verified;
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
    if (!email || !googleId) throw new UnauthorizedException('Invalid Google token');
    // กัน account takeover: ถ้า Google ยังไม่ยืนยันอีเมล ห้ามเอามาผูก/สร้างบัญชี
    // (ไม่งั้นคนที่คุม Google Workspace domain อาจปลอมอีเมลของเหยื่อมา link บัญชีได้)
    if (!emailVerified) throw new UnauthorizedException('Google email is not verified');

    // หาโดย googleId ก่อน แล้วค่อย email (เผื่อเคยสมัคร email/password ไว้ → ผูกเป็นบัญชีเดียวกัน)
    let user =
      (await this.prisma.user.findUnique({ where: { googleId } })) ??
      (await this.prisma.user.findUnique({ where: { email } }));
    if (!user) {
      user = await this.prisma.user.create({ data: { email, name: name ?? email, googleId } });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({ where: { id: user.id }, data: { googleId } });
    }
    return this.issueTokens(user);
  }

  // ขอ access token ใบใหม่ด้วย refresh token — ไม่ rotate (คืน refresh ใบเดิม)
  // "ยัง login อยู่ไหม" ตัดสินจาก hash ใน DB ไม่ใช่เวลา → refresh ไม่มีวันหมดอายุเอง
  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwt.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    // hash ไม่ตรง/เป็น null = ถูกเพิกถอน (logout, login เครื่องอื่น, เปลี่ยนรหัส)
    if (!user || !user.refreshTokenHash || !this.safeEqualHex(user.refreshTokenHash, this.hashToken(refreshToken))) {
      throw new UnauthorizedException('Refresh token revoked');
    }
    return { accessToken: this.signAccess(user), refreshToken };
  }

  // logout = ล้าง hash → refresh token ใบเดิมใช้ต่อไม่ได้ทันที
  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
  }

  // ออก access(15m) + refresh(ไม่หมดอายุ) แล้วเก็บ sha256 ของ refresh ลง DB
  private async issueTokens(user: { id: string; email: string; name: string; role: string }) {
    const accessToken = this.signAccess(user);
    // ไม่ใส่ expiresIn → refresh token ไม่มี exp claim = ไม่หมดอายุ (คุมผ่าน hash ใน DB แทน)
    const refreshToken = this.jwt.sign(
      { sub: user.id },
      { secret: process.env.JWT_REFRESH_SECRET },
    );
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: this.hashToken(refreshToken) },
    });
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  private signAccess(user: { id: string; email: string; role: string }) {
    // access token อายุ 15 นาที — frontend จะต่ออายุให้เองด้วย refresh token
    return this.jwt.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '15m' });
  }

  // sha256 พอ — refresh token เอนโทรปีสูงอยู่แล้ว ไม่ต้อง bcrypt (แถม bcrypt ตัด input ที่ 72 byte)
  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  // เทียบ hash แบบ constant-time กัน timing attack (แทน === ที่ leak เวลาเทียบ)
  private safeEqualHex(a: string, b: string) {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    return ba.length === bb.length && timingSafeEqual(ba, bb);
  }
}
