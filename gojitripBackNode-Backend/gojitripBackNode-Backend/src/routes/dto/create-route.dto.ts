import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  routeName: string;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsNumber()
  totalDistanceKm: number;

  @IsString()
  @IsNotEmpty()
  estimatedTravelTime: string;

  @IsString()
  @IsNotEmpty()
  roadCondition: string;

  @IsString()
  @IsNotEmpty()
  weatherSummary: string;

  @IsString()
  approvalStatus: string;

  @IsString()
  @IsNotEmpty()
  createdByName: string;
}
