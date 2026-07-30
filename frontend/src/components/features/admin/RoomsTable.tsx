'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Room } from '@/lib/api/api.type';
import { updateRoomAction, setRoomActiveAction } from '@/lib/actions/room.action';
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
import { Input } from '@/components/ui/input';
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

export default function RoomsTable({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [edit, setEdit] = useState<{ id: string; name: string; location: string; capacity: string } | null>(null);
  const [error, setError] = useState('');

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setError('');
    startTransition(async () => {
      const res = await updateRoomAction({ id: edit.id, name: edit.name, location: edit.location, capacity: Number(edit.capacity) });
      if (!res.success) return setError(res.message);
      setEdit(null);
      router.refresh();
    });
  }

  function toggle(room: Room) {
    setError('');
    startTransition(async () => {
      const res = await setRoomActiveAction(room.id, !room.isActive);
      if (!res.success) return setError(res.message);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto">
      {error && <p className="mb-2 text-sm text-danger">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={th}>Name</TableHead>
            <TableHead className={th}>Location</TableHead>
            <TableHead className={th}>Capacity</TableHead>
            <TableHead className={th}>Status</TableHead>
            <TableHead className={th}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((r) =>
            edit?.id === r.id ? (
              <TableRow key={r.id}>
                <TableCell><Input className="h-9" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></TableCell>
                <TableCell><Input className="h-9" value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} /></TableCell>
                <TableCell><Input className="h-9" type="number" min="1" value={edit.capacity} onChange={(e) => setEdit({ ...edit, capacity: e.target.value })} /></TableCell>
                <TableCell colSpan={2}>
                  <span className="flex gap-2">
                    <Button size="sm" onClick={save} disabled={pending}>Save</Button>
                    <Button variant="outline" size="sm" onClick={() => setEdit(null)}>Cancel</Button>
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow className={r.isActive ? '' : 'opacity-60'} key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-muted">{r.location}</TableCell>
                <TableCell>{r.capacity}</TableCell>
                <TableCell>
                  {r.isActive
                    ? <Badge variant="success">Active</Badge>
                    : <Badge variant="cancelled">Inactive</Badge>}
                </TableCell>
                <TableCell>
                  <span className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-blue text-blue hover:bg-blue hover:text-white" onClick={() => setEdit({ id: r.id, name: r.name, location: r.location, capacity: String(r.capacity) })}>Edit</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        {r.isActive
                          ? <Button variant="outline" size="sm" className="border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-600" disabled={pending}>Deactivate</Button>
                          : <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700" disabled={pending}>Activate</Button>}
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{r.isActive ? 'ปิดการใช้งานห้องนี้?' : 'เปิดใช้งานห้องนี้อีกครั้ง?'}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {r.isActive
                              ? 'ห้องจะถูกซ่อนจากการค้นหาและจองใหม่ไม่ได้ แต่ประวัติการจองเดิมยังอยู่ครบ'
                              : 'ห้องจะกลับมาแสดงในการค้นหาและเปิดให้จองได้อีกครั้ง'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => toggle(r)}>ยืนยัน</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </span>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}
