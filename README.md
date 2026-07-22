# MeetSpace – ระบบจองห้องประชุมออนไลน์

โปรเจคตาม SRS (Single Project – DevNest School)
Tech Stack: **Next.js + NestJS + PostgreSQL + Prisma + JWT**

## โครงสร้าง

```
meetspace/
├── backend/    # NestJS API (port 3001)
└── frontend/   # Next.js (port 3000)
```

## วิธีติดตั้งและรัน

### 1. เตรียมฐานข้อมูล
ติดตั้ง PostgreSQL แล้วสร้าง database ชื่อ `meetspace`
(หรือใช้ Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=meetspace postgres:16`)

### 2. Backend
```bash
cd backend
cp .env.example .env        # แก้ DATABASE_URL / JWT_SECRET ตามเครื่อง
pnpm install
pnpm exec prisma migrate dev --name init
pnpm run seed               # สร้าง admin + ห้องตัวอย่าง 5 ห้อง (รันซ้ำได้)
pnpm run start:dev          # http://localhost:3001
```
บัญชี Admin จาก seed: `admin@meetspace.dev` / `admin1234`

### 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local
pnpm install
pnpm run dev                # http://localhost:3000
```

## ฟีเจอร์ตามเกณฑ์

| เกณฑ์ | จุดที่อยู่ในโค้ด |
|---|---|
| Sign-up / Login + JWT | `backend/src/auth/` |
| Protected Routes | `JwtAuthGuard` (backend) + redirect ไป /login (frontend) |
| 2 Roles (USER / ADMIN) | `RolesGuard` + `@Roles('ADMIN')` |
| CRUD 2 Entities | Room (`src/rooms/`), Booking (`src/bookings/`) |
| Core Feature 1: จอง + กันจองซ้อน | `BookingsService.assertNoOverlap()` |
| Core Feature 2: Search / Filter | `RoomsService.search()` + หน้าแรก frontend |

## API หลัก

| Method | Path | สิทธิ์ | ทำอะไร |
|---|---|---|---|
| POST | /auth/register | ทุกคน | สมัครสมาชิก |
| POST | /auth/login | ทุกคน | เข้าสู่ระบบ รับ JWT |
| GET | /rooms | ทุกคน | ค้นหาห้อง (keyword, minCapacity, start, end) |
| GET | /rooms/:id | ทุกคน | รายละเอียดห้อง + ตารางจอง |
| POST/PATCH/DELETE | /rooms | Admin | จัดการห้อง |
| POST | /bookings | Login | จองห้อง (เช็คจองซ้อน) |
| GET | /bookings/me | Login | การจองของฉัน |
| PATCH/DELETE | /bookings/:id | เจ้าของ/Admin | แก้ไข / ยกเลิก |
| GET | /bookings | Admin | การจองทั้งหมด |

## หมายเหตุ (สำคัญ)
โค้ดนี้เป็นโครงตั้งต้น — ควรอ่านทำความเข้าใจทุกไฟล์ ลองแก้ ลองพัง ลองเพิ่มฟีเจอร์เอง
เพราะตอนตรวจ Progress และสอบ Project จะต้องอธิบายโค้ดของตัวเองได้
