# MeetSpace – ระบบจองห้องประชุมออนไลน์

Single Project ของ DevNest School (นักเรียน: โอฬาร ศักดิ์หริรักษ์)
โปรเจคนี้ถูก scaffold ไว้แล้ว ให้พัฒนาต่อจากโครงนี้ **อย่าเปลี่ยน tech stack และอย่าเปลี่ยน schema โดยไม่ถาม**

## Tech Stack (โรงเรียนบังคับ ห้ามเปลี่ยน)
- Frontend: Next.js (App Router, JavaScript) — โฟลเดอร์ `frontend/` (port 3000)
- Backend: NestJS + TypeScript — โฟลเดอร์ `backend/` (port 3001)
- Database: PostgreSQL + Prisma ORM
- Auth: JWT (passport-jwt) + bcrypt

## เกณฑ์ที่ต้องผ่าน (จากข้อกำหนดโรงเรียน)
1. Auth: Sign-up, Login, JWT, Protected Routes, มี 2 Roles (USER / ADMIN)
2. CRUD อย่างน้อย 2 Entities → ใช้ Room และ Booking
3. Core Features อย่างน้อย 2 อย่าง (ไม่นับ Auth) → (a) จอง/ยกเลิกห้อง + กันจองซ้อน (b) Search/Filter ห้องว่าง

## โครงสร้างสำคัญ
- `backend/prisma/schema.prisma` — models: User, Room, Booking (+ enums Role, BookingStatus)
- `backend/src/auth/` — register/login, JwtStrategy, JwtAuthGuard, RolesGuard + @Roles('ADMIN')
- `backend/src/rooms/` — CRUD ห้อง (Admin) + search ห้องว่างตามช่วงเวลา
- `backend/src/bookings/` — จอง/แก้/ยกเลิก, **logic กันจองซ้อนอยู่ที่ `assertNoOverlap()`** (เงื่อนไข: startA < endB && endA > startB)
- `frontend/app/` — page.js (ค้นหา), login, register, rooms/[id] (จอง), my-bookings, admin
- `frontend/lib/api.js` — fetch wrapper, เก็บ JWT ใน localStorage
- seed: `pnpm run seed` → admin@meetspace.dev / admin1234 + ห้องตัวอย่าง 5 ห้อง (seed ซ้ำได้ ไม่เพิ่มห้องซ้ำ)

## กติกาการทำงาน
- ตอบและอธิบายเป็นภาษาไทย
- ห้ามลบ business rule กันจองซ้อน
- การลบห้องเป็น soft delete (isActive=false) เพื่อรักษาประวัติการจอง
- การยกเลิกจองเปลี่ยน status เป็น CANCELLED ไม่ลบ record
- อธิบายโค้ดที่แก้ทุกครั้ง เพราะเจ้าของโปรเจคต้องอธิบายได้ตอนตรวจ Progress และสอบ

## เอกสารประกอบ (ทำเสร็จแล้ว ส่งอาจารย์แล้ว/กำลังส่ง)
- SRS: SRS_MeetSpace_ระบบจองห้องประชุม.docx/.pdf (ส่งภายใน 6 ก.ค. 2569)
- ER Diagram: https://dbdiagram.io/d/Meet-Space-6a54e2924ac62e474c935697 (ส่งภายใน 13 ก.ค.)
- UI Mockup อ้างอิง: MeetSpace_UI_Mockup_v2.html (โทนฟ้าเย็น #1E5FA8/#0E2440, ฟอนต์ Chakra Petch + Anuphan) → ใช้เป็นแบบตอนทำหน้าเว็บจริงและ Figma (ส่งภายใน 13 ก.ค.)

## กำหนดการที่เหลือ
- เริ่มเขียนโปรเจค 21 ก.ค. 2569 | ตรวจ Progress: 23, 29, 31 ก.ค. | สอบ Project: 4 ส.ค. 2569

## วิธีรัน
```bash
# ต้องมี PostgreSQL (db ชื่อ meetspace) รันอยู่ก่อน — ใช้ pnpm (ห้าม npm/yarn จะได้ไม่มี lockfile ซ้อน)
cd backend && cp .env.example .env && pnpm install && pnpm exec prisma migrate dev && pnpm run seed && pnpm run start:dev
cd frontend && cp .env.local.example .env.local && pnpm install && pnpm run dev
```

## หมายเหตุ toolchain
- Frontend ใช้ Tailwind CSS v4 แบบ CSS-first: ตั้งธีมใน `@theme` ที่ `frontend/app/globals.css` **ไม่มี tailwind.config.js**
- `backend/pnpm-workspace.yaml` มี `allowBuilds` อนุญาต postinstall ของ bcrypt/prisma (pnpm บล็อกเป็นค่าเริ่มต้น)
