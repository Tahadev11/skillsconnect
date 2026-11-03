import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer'; // <-- ADDED IMPORT

export class CreateServiceDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsNumber()
  @Min(1)
  price: number;

  @IsInt()
  @Min(1)
  deliveryDays: number;

  @IsString()
  @MinLength(2)
  category: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  allowExchange?: boolean;

  @IsOptional()
  @IsString()
  skillsWanted?: string;
}