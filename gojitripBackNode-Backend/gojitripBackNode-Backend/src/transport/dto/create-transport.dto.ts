import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateTransportDto {
  @IsString()
  operatorName: string;

  @IsString()
  contactPerson: string;

  @IsString()
  mobileNumber: string;

  @IsString()
  whatsAppNumber: string;

  @IsString()
  vehicleType: string;

  @IsString()
  vehicleNumber: string;

  @IsInt()
  seatCapacity: number;

  @IsString()
  route: string;

  @IsString()
  pickupPoint: string;

  @IsString()
  departureTime: string;

  @IsNumber()
  fare: number;

  @IsString()
  currency: string;

  @IsString()
  luggagePolicy: string;

  @IsOptional()
  @IsString()
  driverPhotoUrl?: string;

  @IsOptional()
  vehiclePhotos?: string[];

  @IsBoolean()
  licenceVerified: boolean;

  @IsString()
  activeStatus: string;

  @IsString()
  approvalStatus: string;

  @IsString()
  createdByName: string;
}
