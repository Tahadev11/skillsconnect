import {
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsArray()
  @IsIn(['admin', 'instructor', 'student', 'freelancer'], { each: true })
  roles?: ('admin' | 'instructor' | 'student' | 'freelancer')[];
}