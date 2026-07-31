'use client';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateNameSchema, type UpdateNameInput } from '@/lib/schemas/account.schema';
import { updateNameAction, uploadAvatarAction } from '@/lib/actions/account.action';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ProfileForm({
  defaultName,
  email,
  avatarUrl,
}: {
  defaultName: string;
  email: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<{ ok: string; error: string }>({ ok: '', error: '' });

  // ---- รูปโปรไฟล์ (แยกจากฟอร์มชื่อ เพราะเป็นคนละ action / multipart) ----
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarPending, startAvatarTransition] = useTransition();
  const [avatarNote, setAvatarNote] = useState<{ ok: string; error: string }>({ ok: '', error: '' });
  const initial = defaultName.trim().charAt(0).toUpperCase() || '?';
  const shownAvatar = preview ?? avatarUrl;

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setAvatarNote({ ok: '', error: '' });
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function onUploadAvatar() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    startAvatarTransition(async () => {
      const res = await uploadAvatarAction(fd);
      if (!res.success) return setAvatarNote({ ok: '', error: res.message });
      setAvatarNote({ ok: res.message ?? 'Updated', error: '' });
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      router.refresh(); // ดึงรูปใหม่มาโชว์
    });
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateNameInput>({ resolver: zodResolver(updateNameSchema), defaultValues: { name: defaultName } });

  function onSubmit(v: UpdateNameInput) {
    setNote({ ok: '', error: '' });
    startTransition(async () => {
      const res = await updateNameAction(v);
      if (!res.success) return setNote({ ok: '', error: res.message });
      setNote({ ok: res.message ?? 'Saved', error: '' });
      router.refresh(); // อัปเดต nav (ชื่อใหม่)
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        {shownAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shownAvatar} alt="Profile" className="h-16 w-16 rounded-full object-cover ring-1 ring-line" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-2xl font-bold text-white">
            {initial}
          </span>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPickFile}
            className="text-sm file:mr-3 file:rounded-lg file:border file:border-line file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-mist"
          />
          {preview && (
            <Button type="button" size="sm" className="self-start" onClick={onUploadAvatar} disabled={avatarPending}>
              {avatarPending ? 'Uploading...' : 'Upload photo'}
            </Button>
          )}
          {avatarNote.error && <p className="text-sm text-danger">{avatarNote.error}</p>}
          {avatarNote.ok && <p className="text-sm font-medium text-emerald-600">✓ {avatarNote.ok}</p>}
          <p className="text-xs text-muted">JPG, PNG or WebP · max 2MB</p>
        </div>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" className="h-10 bg-mist text-muted" value={email} disabled readOnly />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" className="h-10" {...register('name')} />
          {errors.name && <p className="text-sm text-danger">{errors.name.message}</p>}
        </div>
        {note.error && <p className="text-sm text-danger">{note.error}</p>}
        {note.ok && <p className="text-sm font-medium text-emerald-600">✓ {note.ok}</p>}
        <Button type="submit" className="h-10 self-start" disabled={pending}>
          {pending ? 'Saving...' : 'Save Name'}
        </Button>
      </form>
    </div>
  );
}
