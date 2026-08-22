import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  activityName: string;

  @IsString()
  @IsNotEmpty()
  guideName: string;

  @IsString()
  @IsNotEmpty()
  guideContact: string;

  @IsNumber()
  pricing: number;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsString()
  @IsNotEmpty()
  difficultyLevel: string;

  @IsString()
  @IsNotEmpty()
  availability: string;

  @IsString()
  @IsOptional()
  approvalStatus?: string;

  @IsString()
  @IsOptional()
  createdByName?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  photos?: string[];
}
