'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Booking } from '@/lib/api/api.type';
import { cancelBookingAction, updateBookingAction } from '@/lib/actions/booking.action';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// แปลง ISO เป็นค่าที่ input date/time ใช้ (เวลาท้องถิ่น)
function toInputValue(d: string) {
  const t = new Date(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`,
    time: `${pad(t.getHours())}:${pad(t.getMinutes())}`,
  };
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

export default function MyBookingCard({ booking, editable }: { booking: Booking; editable: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const s = toInputValue(booking.startTime);
  const e = toInputValue(booking.endTime);
  const [edit, setEdit] = useState<{ open: boolean; date: string; start: string; end: string }>({
    open: false,
    date: s.date,
    start: s.time,
    end: e.time,
  });

  function cancel() {
    startTransition(async () => {
      const res = await cancelBookingAction(booking.id);
      if (!res.success) return;
      router.refresh();
    });
  }

  function save(ev: React.FormEvent) {
    ev.preventDefault();
    setError('');
    startTransition(async () => {
      const res = await updateBookingAction({
        id: booking.id,
        startTime: new Date(`${edit.date}T${edit.start}`).toISOString(),
        endTime: new Date(`${edit.date}T${edit.end}`).toISOString(),
      });
      if (!res.success) return setError(res.message);
      setEdit((p) => ({ ...p, open: false }));
      router.refresh();
    });
  }

  const cancelled = booking.status === 'CANCELLED';
  const pill = cancelled ? (
    <Badge variant="cancelled">Cancelled</Badge>
  ) : editable ? (
    <Badge variant="success">Confirmed</Badge>
  ) : (
    <Badge variant="completed">Completed</Badge>
  );

  return (
    <div className="mb-3 rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <p className={`font-semibold ${cancelled ? 'text-muted line-through' : 'text-ink'}`}>{booking.title}</p>
          <p className="mt-1 text-sm text-muted">📍 {booking.room?.name}　📅 {fmtDate(booking.startTime)}　🕐 {fmtTime(booking.startTime)} – {fmtTime(booking.endTime)}</p>
        </div>
        {pill}
        {editable && (
          <span className="flex gap-2">
            <Button variant="outline" size="sm" className="border-blue text-blue hover:bg-blue hover:text-white" onClick={() => setEdit((p) => ({ ...p, open: !p.open }))} disabled={pending}>Edit</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-600" disabled={pending}>Cancel</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการยกเลิกการจองนี้?</AlertDialogTitle>
                  <AlertDialogDescription>
                    การจองจะถูกยกเลิกและช่วงเวลานี้จะว่างให้จองใหม่ได้ (ไม่ลบประวัติการจอง)
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ไม่ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction onClick={cancel}>ยืนยันยกเลิก</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </span>
        )}
      </div>
      {editable && edit.open && (
        <form className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4" onSubmit={save}>
          <div className="flex min-w-35 flex-1 flex-col gap-1">
            <Label htmlFor={`date-${booking.id}`} className="text-xs text-muted">Date</Label>
            <Input id={`date-${booking.id}`} className="h-9" type="date" required value={edit.date} onChange={(ev) => setEdit({ ...edit, date: ev.target.value })} />
          </div>
          <div className="flex min-w-24 flex-1 flex-col gap-1">
            <Label htmlFor={`start-${booking.id}`} className="text-xs text-muted">Start time</Label>
            <Input id={`start-${booking.id}`} className="h-9" type="time" required value={edit.start} onChange={(ev) => setEdit({ ...edit, start: ev.target.value })} />
          </div>
          <div className="flex min-w-24 flex-1 flex-col gap-1">
            <Label htmlFor={`end-${booking.id}`} className="text-xs text-muted">End time</Label>
            <Input id={`end-${booking.id}`} className="h-9" type="time" required value={edit.end} onChange={(ev) => setEdit({ ...edit, end: ev.target.value })} />
          </div>
          <Button type="submit" className="h-9" disabled={pending}>Save</Button>
          <Button type="button" variant="outline" className="h-9" onClick={() => setEdit((p) => ({ ...p, open: false }))}>Cancel</Button>
          {error && <p className="w-full text-sm text-danger">{error}</p>}
        </form>
      )}
    </div>
  );
}
