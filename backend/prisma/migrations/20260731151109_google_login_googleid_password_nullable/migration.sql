-- ทำให้ password เป็น nullable (ผู้ใช้ Google ไม่มีรหัสผ่าน) — ไม่กระทบข้อมูลเดิม
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- เพิ่มคอลัมน์ googleId (nullable) + unique index
ALTER TABLE "User" ADD COLUMN "googleId" TEXT;
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
