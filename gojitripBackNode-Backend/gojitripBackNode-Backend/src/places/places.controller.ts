import { BadRequestException, Controller, Get, Query } from '@nestjs/common';

import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  // ============================================================
  // LOCATION AUTOCOMPLETE
  // GET /api/v1/places/autocomplete?q=Mustang
  // ============================================================

  @Get('autocomplete')
  async autocomplete(@Query('q') query?: string) {
    const cleanQuery = typeof query === 'string' ? query.trim() : '';

    if (!cleanQuery) {
      throw new BadRequestException('Search query is required.');
    }

    if (cleanQuery.length < 2) {
      throw new BadRequestException(
        'Search query must contain at least 2 characters.',
      );
    }

    return this.placesService.autocomplete(cleanQuery);
  }

  // ============================================================
  // LOCATION DETAILS
  // GET /api/v1/places/details?placeId=...
  // ============================================================

  @Get('details')
  async getDetails(@Query('placeId') placeId?: string) {
    const cleanPlaceId = typeof placeId === 'string' ? placeId.trim() : '';

    if (!cleanPlaceId) {
      throw new BadRequestException('placeId is required.');
    }

    return this.placesService.getDetails(cleanPlaceId);
  }

  // ============================================================
  // NEARBY SEARCH
  // GET /api/v1/places/nearby?lat=...&lng=...&radius=...
  // ============================================================

  @Get('nearby')
  async nearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 1000,
  ) {
    if (!lat || !lng) {
      throw new BadRequestException('lat and lng are required.');
    }
    return this.placesService.nearby(Number(lat), Number(lng), Number(radius));
  }
}
