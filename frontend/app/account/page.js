'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken, getUser } from '../../lib/api';

const input = 'w-full rounded-lg border border-line bg-white p-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';
const label = 'mb-1 block text-sm font-medium text-ink';
const btn = 'cursor-pointer rounded-lg bg-blue px-4 py-2.5 font-medium text-white hover:bg-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';

// กล่องแจ้งผลสำเร็จ (เขียว) / error (แดง) ใช้ซ้ำในทั้งสองการ์ด
function Notice({ msg }) {
  if (!msg?.text) return null;
  const ok = msg.type === 'ok';
  return (
    <p className={`rounded-lg border p-3 text-sm font-medium ${ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-600'}`}>
      {ok ? '✓ ' : '⚠️ '}{msg.text}
    </p>
  );
}

export default function Account() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [name, setName] = useState('');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    if (!getToken()) return router.push('/login'); // Protected Route เหมือนหน้า my-bookings
    api('/users/me')
      .then((u) => { setMe(u); setName(u.name); })
      .catch(() => {});
  }, []);

  // การ์ด 1: แก้ชื่อ — สำเร็จแล้วต้องอัปเดต user ใน localStorage ด้วย ไม่งั้น nav ยังโชว์ชื่อเดิม
  async function saveProfile(e) {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const updated = await api('/users/me', { method: 'PATCH', body: JSON.stringify({ name }) });
      setMe(updated);
      const current = getUser();
      localStorage.setItem('user', JSON.stringify({ ...current, name: updated.name }));
      window.dispatchEvent(new Event('user-updated')); // ให้ nav รีเฟรชชื่อทันที
      setProfileMsg({ type: 'ok', text: 'บันทึกชื่อเรียบร้อยแล้ว' });
    } catch (err) { setProfileMsg({ type: 'error', text: err.message }); }
  }

  // การ์ด 2: เปลี่ยนรหัสผ่าน — เช็ครหัสใหม่ตรงกันฝั่งหน้าเว็บก่อน แล้วให้ backend ตรวจรหัสเดิม
  async function changePassword(e) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.newPassword !== pw.confirm) return setPwMsg({ type: 'error', text: 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน' });
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword: pw.currentPassword, newPassword: pw.newPassword })
      });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg({ type: 'ok', text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });
    } catch (err) { setPwMsg({ type: 'error', text: err.message }); }
  }

  if (!me) return <p className="text-sm text-muted">กำลังโหลด...</p>;
  const joined = new Date(me.createdAt).toLocaleDateString('th-TH', { dateStyle: 'long' });

  return (
    <>
      <h1 className="text-3xl font-bold text-navy">บัญชีของฉัน</h1>
      <p className="mt-1 mb-5 text-muted">
        {me.email} · {me.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'สมาชิก'} · เข้าร่วมเมื่อ {joined}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="self-start rounded-xl border border-line bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-navy">ข้อมูลส่วนตัว</h3>
          <form className="flex flex-col gap-4" onSubmit={saveProfile}>
            <div>
              <span className={label}>ชื่อ-นามสกุล</span>
              <input className={input} required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <span className={label}>อีเมล</span>
              <input className={`${input} cursor-not-allowed bg-mist text-muted`} value={me.email} disabled />
              <p className="mt-1 text-xs text-muted">อีเมลใช้เข้าสู่ระบบ ไม่สามารถเปลี่ยนได้</p>
            </div>
            <Notice msg={profileMsg} />
            <button className={`${btn} self-start`} type="submit">บันทึกชื่อ</button>
          </form>
        </div>

        <div className="self-start rounded-xl border border-line bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-navy">เปลี่ยนรหัสผ่าน</h3>
          <form className="flex flex-col gap-4" onSubmit={changePassword}>
            <div>
              <span className={label}>รหัสผ่านเดิม</span>
              <input className={input} type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
            </div>
            <div>
              <span className={label}>รหัสผ่านใหม่</span>
              <input className={input} type="password" placeholder="อย่างน้อย 8 ตัวอักษร" minLength={8} required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
            </div>
            <div>
              <span className={label}>ยืนยันรหัสผ่านใหม่</span>
              <input className={input} type="password" minLength={8} required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            </div>
            <Notice msg={pwMsg} />
            <button className={`${btn} self-start`} type="submit">เปลี่ยนรหัสผ่าน</button>
          </form>
        </div>
      </div>
    </>
  );
}
