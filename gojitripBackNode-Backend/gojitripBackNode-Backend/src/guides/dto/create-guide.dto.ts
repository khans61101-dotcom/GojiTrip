import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateGuideDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsArray()
  @IsOptional()
  languages?: string[];

  @IsNumber()
  @IsOptional()
  experienceYears?: number;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsNumber()
  @IsOptional()
  dailyRate?: number;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  approvalStatus?: string;

  @IsString()
  @IsOptional()
  createdByName?: string;
}
