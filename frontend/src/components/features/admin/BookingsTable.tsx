'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Booking } from '@/lib/api/api.type';
import { cancelBookingAction } from '@/lib/actions/booking.action';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

const th = 'bg-mist font-semibold text-muted';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

export default function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function cancel(id: string) {
    startTransition(async () => {
      const res = await cancelBookingAction(id);
      if (!res.success) return;
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={th}>Title</TableHead>
            <TableHead className={th}>Room</TableHead>
            <TableHead className={th}>Booked by</TableHead>
            <TableHead className={th}>Time</TableHead>
            <TableHead className={th}>Status</TableHead>
            <TableHead className={th}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => (
            <TableRow className={b.status === 'CANCELLED' ? 'opacity-60' : ''} key={b.id}>
              <TableCell className="font-medium">{b.title}</TableCell>
              <TableCell className="text-muted">{b.room?.name}</TableCell>
              <TableCell>{b.user?.name}</TableCell>
              <TableCell className="whitespace-nowrap text-muted">{fmtDate(b.startTime)} · {fmtTime(b.startTime)}–{fmtTime(b.endTime)}</TableCell>
              <TableCell>
                {b.status === 'CONFIRMED'
                  ? <Badge variant="success">Confirmed</Badge>
                  : <Badge variant="cancelled">Cancelled</Badge>}
              </TableCell>
              <TableCell>
                {b.status === 'CONFIRMED' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-600" disabled={pending}>Cancel</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ยกเลิกการจองนี้แทนผู้ใช้?</AlertDialogTitle>
                        <AlertDialogDescription>
                          สถานะการจองจะเปลี่ยนเป็น Cancelled และช่วงเวลานี้จะว่างให้จองใหม่ได้ (ไม่ลบประวัติ)
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={() => cancel(b.id)}>ยืนยัน</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
