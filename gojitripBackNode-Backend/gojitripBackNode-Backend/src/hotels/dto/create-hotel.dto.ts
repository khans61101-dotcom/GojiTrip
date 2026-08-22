import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  @IsNotEmpty()
  hotelName: string;

  @IsString()
  @IsNotEmpty()
  propertyType: string;

  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  checkInTime: string;

  @IsString()
  @IsNotEmpty()
  checkOutTime: string;

  @IsString()
  @IsNotEmpty()
  availabilityStatus: string;

  @IsString()
  @IsNotEmpty()
  partnerStatus: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  approvalStatus: string;

  @IsString()
  @IsNotEmpty()
  createdByName: string;
}
