import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const rooms = [
  { name: 'Room A', location: 'ชั้น 1', capacity: 6, equipment: ['TV', 'Whiteboard'] },
  { name: 'Room B', location: 'ชั้น 2', capacity: 12, equipment: ['Projector', 'Whiteboard'] },
  { name: 'Focus Pod', location: 'ชั้น 2', capacity: 4, equipment: ['Whiteboard'] },
  { name: 'Board Room', location: 'ชั้น 3', capacity: 20, equipment: ['Projector', 'TV', 'Conference Phone'] },
  { name: 'Training Room', location: 'ชั้น 4', capacity: 30, equipment: ['Projector', 'Microphone', 'Speaker'] },
];

async function main() {
  const adminPass = await bcrypt.hash('admin1234', 10);
  await prisma.user.upsert({
    where: { email: 'admin@meetspace.dev' },
    update: {},
    create: { name: 'Admin', email: 'admin@meetspace.dev', password: adminPass, role: Role.ADMIN },
  });
  // สร้างเฉพาะห้องที่ยังไม่มี (เช็คจากชื่อ) รัน seed ซ้ำได้โดยห้องไม่เบิ้ล
  for (const room of rooms) {
    const exists = await prisma.room.findFirst({ where: { name: room.name } });
    if (!exists) await prisma.room.create({ data: room });
  }
  console.log(`Seed เสร็จแล้ว (admin@meetspace.dev / admin1234, ${rooms.length} ห้อง)`);
}

main().finally(() => prisma.$disconnect());
