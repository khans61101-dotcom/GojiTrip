import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GoogleMapsService } from './google-maps.service';
import { DirectionsDto } from './dto/directions.dto';

@Controller('google')
export class GoogleMapsController {
  constructor(private readonly googleMapsService: GoogleMapsService) {}

  // POST /api/v1/google/directions (or /api/google/directions)
  @Post('directions')
  async getDirections(@Body() dto: DirectionsDto) {
    return this.googleMapsService.getDirections(dto);
  }

  // GET /api/v1/google/geocode (or /api/google/geocode)
  @Get('geocode')
  async getGeocode(@Query('address') address: string) {
    return this.googleMapsService.getGeocode(address);
  }
}
