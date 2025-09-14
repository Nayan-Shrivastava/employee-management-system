import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAbsenceDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsNotEmpty()
  reason!: string;
}

// Update Absence DTO
export class UpdateAbsenceDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  reason?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
