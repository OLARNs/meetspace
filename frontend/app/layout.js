import './globals.css';
import Nav from './nav';
import { Chakra_Petch, Anuphan } from 'next/font/google';

// ฟอนต์ตาม UI Mockup v2 — ตัวแปรนี้ถูกอ้างต่อใน @theme ของ globals.css
const chakra = Chakra_Petch({ subsets: ['thai', 'latin'], weight: ['500', '600', '700'], variable: '--font-chakra' });
const anuphan = Anuphan({ subsets: ['thai', 'latin'], variable: '--font-anuphan' });

export const metadata = { title: 'MeetSpace – ระบบจองห้องประชุม' };

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${chakra.variable} ${anuphan.variable}`}>
      <body className="bg-mist font-body text-ink">
        <Nav />
        <main className="mx-auto my-6 max-w-240 px-4">{children}</main>
      </body>
    </html>
  );
}
