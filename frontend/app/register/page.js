'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api, saveAuth } from '../../lib/api';

const input = 'w-full rounded-lg border border-line bg-white p-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue';
const label = 'mb-1 block text-sm font-medium text-ink';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    // เช็คฝั่งหน้าเว็บก่อนยิง API: รหัสผ่านสองช่องต้องตรงกัน
    if (form.password !== form.confirm) return setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
    try {
      const { confirm, ...payload } = form;
      saveAuth(await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) }));
      window.location.href = '/';
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="mx-auto mt-12 max-w-105">
      <p className="mb-6 text-center font-display text-2xl font-bold text-navy">
        MeetSpace
        <span className="ml-1.5 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,.45)]" />
      </p>
      <div className="rounded-xl border border-line bg-white p-7 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-navy">สมัครสมาชิก</h1>
        <p className="mt-1 mb-6 text-center text-sm text-muted">สร้างบัญชีเพื่อเริ่มจองห้องประชุม</p>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <div>
            <span className={label}>ชื่อ-นามสกุล</span>
            <input className={input} placeholder="สมชาย ใจดี" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <span className={label}>อีเมล</span>
            <input className={input} type="email" placeholder="you@company.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <span className={label}>รหัสผ่าน</span>
            <input className={input} type="password" placeholder="อย่างน้อย 8 ตัวอักษร" minLength={8} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <span className={label}>ยืนยันรหัสผ่าน</span>
            <input className={input} type="password" placeholder="••••••••" minLength={8} required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button className="cursor-pointer rounded-lg bg-blue px-4 py-2.5 font-medium text-white hover:bg-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue" type="submit">
            สมัครสมาชิก
          </button>
        </form>
        <p className="mt-5 text-center text-sm">มีบัญชีแล้ว? <Link className="font-semibold text-blue hover:underline" href="/login">เข้าสู่ระบบ</Link></p>
      </div>
      <p className="mt-6 text-center"><Link className="text-sm text-muted hover:text-ink" href="/">← กลับหน้าหลัก</Link></p>
    </div>
  );
}
