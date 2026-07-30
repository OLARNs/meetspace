# MeetSpace – ระบบจองห้องประชุมออนไลน์

Single Project ของ DevNest School (นักเรียน: โอฬาร ศักดิ์หริรักษ์)
โปรเจคนี้ถูก scaffold ไว้แล้ว ให้พัฒนาต่อจากโครงนี้ **อย่าเปลี่ยน tech stack และอย่าเปลี่ยน schema โดยไม่ถาม**

## Tech Stack (ตาม SRS ที่ส่งอาจารย์ — SRS ระบุแค่ "Next.js" ไม่ล็อกภาษา)
- Frontend: Next.js (App Router, **TypeScript**) — โฟลเดอร์ `frontend/` (port 3000)
  - แนว decoupled/BFF ตาม fakebuck: next-auth v5 ถือ access_token, RSC + Server Actions, `lib/api/` typed fetch layer, ไม่มี DB ฝั่ง web
- Backend: NestJS + TypeScript — โฟลเดอร์ `backend/` (port 3001)
- Database: PostgreSQL + Prisma ORM
- Auth: JWT (passport-jwt) + bcrypt

> หมายเหตุ: เดิม scaffold ใส่ "JavaScript ห้ามเปลี่ยน" ไว้ แต่ SRS จริงเขียนแค่ "Next.js"
> จึงรื้อ frontend เป็น TypeScript ตาม fakebuck ได้ (เวอร์ชัน JS เดิมเก็บไว้ที่ branch `main`)

## เกณฑ์ที่ต้องผ่าน (จากข้อกำหนดโรงเรียน)
1. Auth: Sign-up, Login, JWT, Protected Routes, มี 2 Roles (USER / ADMIN)
2. CRUD อย่างน้อย 2 Entities → ใช้ Room และ Booking
3. Core Features อย่างน้อย 2 อย่าง (ไม่นับ Auth) → (a) จอง/ยกเลิกห้อง + กันจองซ้อน (b) Search/Filter ห้องว่าง

## โครงสร้างสำคัญ
- `backend/prisma/schema.prisma` — models: User, Room, Booking, BookingParticipant (ยังไม่ได้ใช้จริง — เตรียมไว้เผื่อฟีเจอร์ Optional "เชิญผู้เข้าร่วม" ที่ตัดสินใจไม่ทำรอบนี้) + enums Role, BookingStatus, ParticipantStatus
- `backend/src/auth/` — register/login/me, JwtStrategy, JwtAuthGuard, RolesGuard + @Roles('ADMIN')
- `backend/src/users/` — GET/PATCH `/users/me` (แก้ชื่อ, เปลี่ยนรหัสผ่านต้องยืนยันรหัสเดิม)
- `backend/src/rooms/` — CRUD ห้อง (Admin) + search ห้องว่างตามช่วงเวลา + `/rooms/schedule` (ตาราง timeline รายวัน)
- `backend/src/bookings/` — จอง/แก้/ยกเลิก, **logic กันจองซ้อนอยู่ที่ `assertNoOverlap()`** (เงื่อนไข: startA < endB && endA > startB)
- `frontend/src/app/` — page.tsx (ค้นหา+timeline), login, register, rooms/[id] (จอง), my-bookings, account, admin — ทุกหน้าเป็น Server Component ที่ดึงข้อมูลตรง ไม่มี useEffect+fetch
- `frontend/src/lib/api/` — typed fetch layer: `apiFetch` (public), `authFetch` (แนบ Bearer จาก session อัตโนมัติ) + resource api ต่อ entity (`rooms.api.ts` ฯลฯ)
- `frontend/src/lib/auth.ts` — next-auth v5 (Credentials → เรียก NestJS API), session ถือ accessToken **แทน localStorage เดิม**
- `frontend/src/lib/actions/` — Server Actions (validate ด้วย zod) สำหรับทุก mutation (จอง/แก้ห้อง/เปลี่ยนรหัสผ่าน ฯลฯ)
- `frontend/src/middleware.ts` — กัน route ที่ต้อง login + กัน `/admin` เฉพาะ role ADMIN
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
cd backend && pnpm install && pnpm exec prisma migrate dev && pnpm run seed && pnpm run start:dev
cd frontend && pnpm install && pnpm run dev
# ทั้งสองฝั่งมีไฟล์ .env อยู่แล้ว (ไม่มี .example) แก้ค่าตรงในไฟล์นั้นได้เลย
```

## หมายเหตุ toolchain
- Frontend ใช้ Tailwind CSS v4 แบบ CSS-first: ตั้งธีมใน `@theme` ที่ `frontend/src/app/globals.css` **ไม่มี tailwind.config.js**
- `backend/pnpm-workspace.yaml` มี `allowBuilds` อนุญาต postinstall ของ bcrypt/prisma (pnpm บล็อกเป็นค่าเริ่มต้น)

## Package ที่ต้องเพิ่มถ้าจะทำ feature เหล่านี้ (ยังไม่ได้ทำ — กันลืมว่าต้องลง lib อะไร)
| อยากทำ feature นี้ | ต้องเพิ่ม package | เพิ่มฝั่งไหน |
|---|---|---|
| อัปโหลดรูปโปรไฟล์/รูปห้อง | `multer` (Nest มี built-in ผ่าน `@nestjs/platform-express` อยู่แล้ว) + ถ้าเก็บบน cloud ใช้ `cloudinary` หรือ `@aws-sdk/client-s3` | backend |
| ส่งอีเมลแจ้งเตือนการจอง | `nodemailer` หรือ `@nestjs-modules/mailer` | backend |
| แสดงกราฟ/สถิติในหน้า admin | `recharts` หรือ `chart.js` | frontend |
| Realtime (เห็นคนอื่นจองห้องแบบสด ไม่ต้อง refresh) | `socket.io` (backend) + `socket.io-client` (frontend) | ทั้งคู่ |
| เขียน automated test | `jest`, `@nestjs/testing` | backend |
| Rate limiting กันสแปม | `@nestjs/throttler` | backend |
| Animation ในหน้าเว็บ | `framer-motion` | frontend |
| Icon แทน emoji | `lucide-react` | frontend |
| Validate env vars ฝั่ง backend ให้เข้มแบบ zod | `zod` (frontend มีอยู่แล้ว, backend ยังไม่มี) | backend |
