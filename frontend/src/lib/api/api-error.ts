// error ที่โยนออกจาก apiFetch เมื่อ API ตอบ non-2xx — พก statusCode ให้ action ตัดสินใจต่อได้
export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
