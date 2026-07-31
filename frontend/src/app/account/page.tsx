import { UsersApi } from '@/lib/api/users.api';
import ProfileForm from '@/components/features/account/ProfileForm';
import PasswordForm from '@/components/features/account/PasswordForm';

export default async function AccountPage() {
  const me = await UsersApi.me();

  return (
    <>
      <h1 className="text-3xl font-bold text-navy">My Account</h1>
      <p className="mt-1 mb-5 text-muted">Edit your name and change your account password</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="self-start rounded-xl border border-line bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-navy">Profile</h3>
          <ProfileForm defaultName={me.name} email={me.email} />
        </div>
        <div className="self-start rounded-xl border border-line bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-navy">Change Password</h3>
          {me.hasPassword ? (
            <PasswordForm />
          ) : (
            <p className="text-sm text-muted">
              You signed in with Google, so there&apos;s no password to change.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
