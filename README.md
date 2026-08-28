# MeetSpace – ระบบจองห้องประชุมออนไลน์

เว็บแอปจองห้องประชุมแบบ full-stack ที่แยก frontend / backend ออกจากกัน (decoupled + BFF)
ผู้ใช้ค้นหาห้องว่างตามช่วงเวลา จองห้อง และจัดการการจองของตัวเองได้ ส่วนแอดมินจัดการห้องและดูการจองทั้งระบบ
**จุดสำคัญของระบบคือ logic กันจองซ้อน** — ห้องเดียวกันจะถูกจองทับช่วงเวลากันไม่ได้

> Single Project ของ DevNest School — พัฒนาตาม SRS ที่เขียนเอง

## Tech Stack

| ส่วน | ใช้อะไร |
|---|---|
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · React Hook Form + Zod |
| Backend | NestJS 10 · TypeScript · class-validator · Passport (JWT) |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh token) · bcrypt · Google OAuth ผ่าน next-auth v5 |
| อื่น ๆ | Cloudinary (อัปโหลดรูปโปรไฟล์) · @nestjs/throttler (rate limit) |

## ฟีเจอร์

**การจองห้อง**
- ค้นหาห้องว่างตาม keyword / ความจุ / ช่วงเวลาที่ต้องการ
- ดูตาราง timeline การจองรายวันของทุกห้อง
- จอง / แก้ไข / ยกเลิกการจอง โดย**กันจองซ้อนอัตโนมัติ** (`startA < endB && endA > startB`)
- ยกเลิกแล้วไม่ลบ record แต่เปลี่ยนสถานะเป็น `CANCELLED` เพื่อเก็บประวัติ

**บัญชีผู้ใช้และสิทธิ์**
- สมัครสมาชิก / เข้าสู่ระบบด้วย JWT
- **Sign in with Google** (verify `id_token` ฝั่ง backend ด้วย `google-auth-library`)
- **Refresh token** — เก็บเป็น hash ในตาราง User และหมุนทุกครั้งที่ refresh
- 2 บทบาท USER / ADMIN แยกสิทธิ์ด้วย `RolesGuard` + `@Roles('ADMIN')`
- แก้ชื่อ / เปลี่ยนรหัสผ่าน (ต้องยืนยันรหัสเดิม) / **อัปโหลดรูปโปรไฟล์** ขึ้น Cloudinary

**สำหรับแอดมิน**
- CRUD ห้องประชุม โดยการลบเป็น soft delete (`isActive = false`) เพื่อไม่ให้ประวัติการจองหาย
- ดูการจองทั้งหมดในระบบ

## สถาปัตยกรรม

frontend ไม่ต่อ database เอง — ทุกอย่างวิ่งผ่าน NestJS API และเบราว์เซอร์ไม่เคยเรียก API ตรง

```
Browser ──> Next.js (Server Components / Server Actions) ──> NestJS API ──> PostgreSQL
             └─ next-auth v5 ถือ accessToken ไว้ใน session cookie
```

- ทุกหน้าเป็น **Server Component** ที่ดึงข้อมูลตอน render ไม่มี `useEffect` + `fetch`
- ทุก mutation ผ่าน **Server Action** ที่ validate ด้วย zod ก่อนยิงเข้า API
- `src/lib/api/` เป็น typed fetch layer — `api-fetch.ts` (public) และ `auth-fetch.ts` (แนบ Bearer token จาก session ให้อัตโนมัติ)
- `src/middleware.ts` กัน route ที่ต้อง login และกัน `/admin` ให้เฉพาะ role ADMIN

## วิธีติดตั้งและรัน

ต้องมี Node.js 20+, pnpm และ PostgreSQL

### 1. เตรียมฐานข้อมูล

สร้าง database ชื่อ `meetspace` หรือใช้ Docker:

```bash
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=meetspace postgres:16
```

### 2. Backend (port 3001)

```bash
cd backend
cp .env.example .env        # แก้ DATABASE_URL / JWT_SECRET (ดูคำอธิบายแต่ละตัวในไฟล์)
pnpm install
pnpm exec prisma migrate dev
pnpm run seed               # สร้าง admin + ห้องตัวอย่าง 5 ห้อง (รันซ้ำได้ ไม่เพิ่มห้องซ้ำ)
pnpm run start:dev
```

บัญชีแอดมินจาก seed: `admin@meetspace.dev` / `admin1234`

### 3. Frontend (port 3000)

```bash
cd frontend
cp .env.example .env        # อย่างน้อยต้องใส่ AUTH_SECRET → สร้างด้วย pnpm exec auth secret
pnpm install
pnpm run dev
```

เปิด http://localhost:3000

> Google login และการอัปโหลดรูปโปรไฟล์ต้องใส่ค่า `AUTH_GOOGLE_*` / `CLOUDINARY_URL` เพิ่ม
> ถ้าปล่อยว่างไว้ ส่วนที่เหลือของระบบยังใช้งานได้ครบ

## API

| Method | Path | สิทธิ์ | ทำอะไร |
|---|---|---|---|
| POST | `/auth/register` | ทุกคน | สมัครสมาชิก |
| POST | `/auth/login` | ทุกคน | เข้าสู่ระบบ รับ access + refresh token |
| POST | `/auth/refresh` | ทุกคน | ขอ access token ใหม่ด้วย refresh token |
| POST | `/auth/google` | ทุกคน | เข้าสู่ระบบด้วย Google id_token |
| POST | `/auth/logout` | Login | ล้าง refresh token ใน DB |
| GET | `/auth/me` | Login | ข้อมูลผู้ใช้ปัจจุบัน |
| GET | `/users/me` | Login | โปรไฟล์ |
| PATCH | `/users/me` | Login | แก้ชื่อ / เปลี่ยนรหัสผ่าน |
| POST | `/users/me/avatar` | Login | อัปโหลดรูปโปรไฟล์ (multipart) |
| GET | `/rooms` | ทุกคน | ค้นหาห้อง (`keyword`, `minCapacity`, `start`, `end`) |
| GET | `/rooms/schedule` | ทุกคน | ตาราง timeline รายวัน (`date`) |
| GET | `/rooms/:id` | ทุกคน | รายละเอียดห้อง + ตารางจอง |
| POST · PATCH · DELETE | `/rooms` | Admin | จัดการห้อง (DELETE = soft delete) |
| POST | `/bookings` | Login | จองห้อง (ตรวจจองซ้อน) |
| GET | `/bookings/me` | Login | การจองของฉัน |
| PATCH · DELETE | `/bookings/:id` | เจ้าของ / Admin | แก้ไข / ยกเลิก |
| GET | `/bookings` | Admin | การจองทั้งหมด |

route กลุ่ม `/auth` มี rate limit 10 ครั้ง/นาที กันการยิงเดารหัสผ่าน

## โครงสร้างโปรเจค

```
meetspace/
├── backend/
│   ├── prisma/schema.prisma    # User, Room, Booking, BookingParticipant
│   └── src/
│       ├── auth/               # register/login/refresh/google, JwtStrategy, RolesGuard
│       ├── users/              # โปรไฟล์ + อัปโหลด avatar
│       ├── rooms/              # CRUD ห้อง + search + schedule
│       └── bookings/           # จอง/แก้/ยกเลิก + assertNoOverlap()
└── frontend/
    └── src/
        ├── app/                # page (ค้นหา+timeline), login, register, rooms/[id],
        │                       # my-bookings, account, admin
        ├── lib/api/            # typed fetch layer
        ├── lib/actions/        # Server Actions + zod schema
        ├── lib/auth.ts         # next-auth v5
        └── middleware.ts       # ป้องกัน route
```

## จุดที่น่าดูในโค้ด

| อยากดูอะไร | ไปที่ |
|---|---|
| logic กันจองซ้อน | `backend/src/bookings/bookings.service.ts` → `assertNoOverlap()` |
| ค้นหาห้องว่างตามช่วงเวลา | `backend/src/rooms/rooms.service.ts` → `search()` |
| refresh token rotation | `backend/src/auth/auth.service.ts` |
| แนบ token ให้ทุก request อัตโนมัติ | `frontend/src/lib/api/auth-fetch.ts` → `authFetch()` |
