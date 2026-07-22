import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Chakra_Petch, Anuphan } from 'next/font/google';
import Nav from '@/components/Nav';

// ฟอนต์ตาม UI Mockup v2 — ตัวแปรถูกอ้างต่อใน @theme ของ globals.css
const chakra = Chakra_Petch({ subsets: ['thai', 'latin'], weight: ['500', '600', '700'], variable: '--font-chakra' });
const anuphan = Anuphan({ subsets: ['thai', 'latin'], variable: '--font-anuphan' });

export const metadata: Metadata = { title: 'MeetSpace – ระบบจองห้องประชุม' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className={`${chakra.variable} ${anuphan.variable}`}>
      <body className="bg-mist font-body text-ink">
        <Nav />
        <main className="mx-auto my-6 max-w-240 px-4">{children}</main>
      </body>
    </html>
  );
}
