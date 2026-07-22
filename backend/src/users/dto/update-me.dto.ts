import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMeDto {
  @IsString() @IsOptional() name?: string;

  // ต้องส่งรหัสผ่านเดิมมาด้วยทุกครั้งที่จะเปลี่ยนรหัสผ่าน (เช็คสิทธิ์ก่อนแก้)
  @IsString() @IsOptional() currentPassword?: string;
  @IsString() @MinLength(8) @IsOptional() newPassword?: string;
}
