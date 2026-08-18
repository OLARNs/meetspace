// สัญญา (contract) ของ response จาก NestJS API — type ต่อ endpoint ไม่ห่อ envelope
export type Role = 'USER' | 'ADMIN';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

// hasPassword: false = บัญชี Google ล้วน (ไม่มีรหัสผ่าน) → ซ่อนฟอร์มเปลี่ยนรหัส
export type Me = AuthUser & { createdAt: string; hasPassword: boolean; avatarUrl: string | null };

export type Room = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  equipment: string[];
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  available?: boolean; // มีเฉพาะตอน search พร้อมช่วงเวลา
};

// booking ย่อในตารางของห้อง / timeline
export type ScheduleBooking = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  userId?: string;
  user?: { name: string };
};

export type ScheduleRoom = {
  id: string;
  name: string;
  bookings: ScheduleBooking[];
};

export type RoomDetail = Room & { bookings: ScheduleBooking[] };

export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export type Booking = {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
  room?: { id: string; name: string };
  user?: { id: string; name: string; email: string };
};
