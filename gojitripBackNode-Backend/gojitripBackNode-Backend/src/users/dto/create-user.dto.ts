import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsBoolean()
  is_active: boolean;

  @IsBoolean()
  is_superuser: boolean;
}
