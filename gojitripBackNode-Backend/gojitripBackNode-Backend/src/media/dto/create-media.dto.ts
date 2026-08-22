import { IsString, IsNumber, IsArray, IsNotEmpty } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  fileType: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsNumber()
  fileSizeMb: number;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  @IsNotEmpty()
  uploadedBy: string;
}
