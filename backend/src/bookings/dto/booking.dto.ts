import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString() roomId: string;
  @IsString() title: string;
  @IsDateString() startTime: string;
  @IsDateString() endTime: string;
}

export class UpdateBookingDto {
  @IsString() @IsOptional() title?: string;
  @IsDateString() @IsOptional() startTime?: string;
  @IsDateString() @IsOptional() endTime?: string;
}
