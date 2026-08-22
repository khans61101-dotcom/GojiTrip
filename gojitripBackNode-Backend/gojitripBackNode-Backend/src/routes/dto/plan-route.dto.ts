import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================================
// ROUTE LOCATION DTO
// ============================================================

export class RouteLocationDto {
  @IsOptional()
  @IsString()
  placeId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

// ============================================================
// PLAN ROUTE DTO
// ============================================================

export class PlanRouteDto {
  @ValidateNested()
  @Type(() => RouteLocationDto)
  source: RouteLocationDto;

  @ValidateNested()
  @Type(() => RouteLocationDto)
  destination: RouteLocationDto;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsNumber()
  travellers?: number;
}
