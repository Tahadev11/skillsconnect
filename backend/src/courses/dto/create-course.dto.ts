import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  IsUrl, // <-- Add this
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublished?: boolean;

  // --- ADDED: Video Link ---
  @IsOptional()
  @IsString()
  // Note: Using @IsString() instead of @IsUrl() because Google Drive links sometimes fail strict URL validation
  videoUrl?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  allowExchange?: boolean;

  @IsOptional()
  @IsString()
  skillsWanted?: string;
}