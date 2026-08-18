import Link from 'next/link';
import LoginForm from '@/components/features/auth/LoginForm';
import GoogleSignInButton from '@/components/features/auth/GoogleSignInButton';

export default function LoginPage({ searchParams }: { searchParams: { expired?: string } }) {
  const expired = searchParams.expired === '1';
  return (
    <div className="mx-auto mt-12 max-w-105">
      <p className="mb-6 text-center font-display text-2xl font-bold text-navy">
        MeetSpace
        <span className="ml-1.5 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,.45)]" />
      </p>
      <div className="rounded-xl border border-line bg-white p-7 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-navy">Sign In</h1>
        {expired && (
          <p className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-center text-sm text-amber-800">
            Session expired. Please sign in again.
          </p>
        )}
        <LoginForm />
        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
        </div>
        <GoogleSignInButton />
        <p className="mt-5 text-center text-sm">
          Don&apos;t have an account? <Link className="font-semibold text-blue hover:underline" href="/register">Sign up</Link>
        </p>
      </div>
      <p className="mt-6 text-center">
        <Link className="text-sm text-muted hover:text-ink" href="/">← Back to home</Link>
      </p>
    </div>
  );
}
