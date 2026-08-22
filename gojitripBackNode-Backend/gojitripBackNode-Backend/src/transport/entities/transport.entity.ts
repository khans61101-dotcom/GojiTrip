export class Transport {
  id: number;
  operatorName: string;
  contactPerson: string;
  mobileNumber: string;
  whatsAppNumber: string;
  vehicleType: string;
  vehicleNumber: string;
  seatCapacity: number;
  route: string;
  pickupPoint: string;
  departureTime: string;
  fare: number;
  currency: string;
  luggagePolicy: string;
  driverPhotoUrl?: string | null;
  vehiclePhotos: string[];
  licenceVerified: boolean;
  activeStatus: string;
  approvalStatus: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}
