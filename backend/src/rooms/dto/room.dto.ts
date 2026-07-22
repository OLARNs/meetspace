import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString() name: string;
  @IsString() location: string;
  @IsInt() @Min(1) capacity: number;
  @IsArray() @IsOptional() equipment?: string[];
  @IsString() @IsOptional() imageUrl?: string;
}

export class UpdateRoomDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() location?: string;
  @IsInt() @Min(1) @IsOptional() capacity?: number;
  @IsArray() @IsOptional() equipment?: string[];
  @IsString() @IsOptional() imageUrl?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}

export class SearchRoomsDto {
  @IsOptional() keyword?: string;
  @IsOptional() minCapacity?: string;
  @IsOptional() equipment?: string;
  @IsOptional() start?: string; // ISO datetime
  @IsOptional() end?: string;   // ISO datetime
  @IsOptional() all?: string;   // 'true' = รวมห้องที่ปิดใช้งาน (หน้า admin)
}
