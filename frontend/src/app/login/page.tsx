import Link from 'next/link';
import LoginForm from '@/components/features/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="mx-auto mt-12 max-w-105">
      <p className="mb-6 text-center font-display text-2xl font-bold text-navy">
        MeetSpace
        <span className="ml-1.5 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,.45)]" />
      </p>
      <div className="rounded-xl border border-line bg-white p-7 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-navy">เข้าสู่ระบบ</h1>
        <LoginForm />
        <p className="mt-5 text-center text-sm">
          ยังไม่มีบัญชี? <Link className="font-semibold text-blue hover:underline" href="/register">สมัครสมาชิก</Link>
        </p>
      </div>
      <p className="mt-6 text-center">
        <Link className="text-sm text-muted hover:text-ink" href="/">← กลับหน้าหลัก</Link>
      </p>
    </div>
  );
}
