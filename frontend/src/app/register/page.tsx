import Link from 'next/link';
import RegisterForm from '@/components/features/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="mx-auto mt-12 max-w-105">
      <p className="mb-6 text-center font-display text-2xl font-bold text-navy">
        MeetSpace
        <span className="ml-1.5 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,.45)]" />
      </p>
      <div className="rounded-xl border border-line bg-white p-7 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-navy">สมัครสมาชิก</h1>
        <p className="mt-1 mb-6 text-center text-sm text-muted">สร้างบัญชีเพื่อเริ่มจองห้องประชุม</p>
        <RegisterForm />
        <p className="mt-5 text-center text-sm">
          มีบัญชีแล้ว? <Link className="font-semibold text-blue hover:underline" href="/login">เข้าสู่ระบบ</Link>
        </p>
      </div>
      <p className="mt-6 text-center">
        <Link className="text-sm text-muted hover:text-ink" href="/">← กลับหน้าหลัก</Link>
      </p>
    </div>
  );
}
