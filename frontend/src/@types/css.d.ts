// ให้ tsc รู้จัก side-effect import ของไฟล์ .css (Next.js เป็นตัวจัดการจริงตอน build)
declare module '*.css';
