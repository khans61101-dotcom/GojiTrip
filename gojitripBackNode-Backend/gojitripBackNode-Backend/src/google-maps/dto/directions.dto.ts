import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DirectionsDto {
  @IsString()
  @IsNotEmpty()
  origin!: string;

  @IsString()
  @IsNotEmpty()
  destination!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  waypoints?: string[];

  @IsOptional()
  @IsString()
  mode?: string;
}
