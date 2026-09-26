import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DirectionsDto } from './dto/directions.dto';
import { googleMapsCache } from './cache.util';

const DIRECTIONS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const GEOCODE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);

  constructor(private readonly configService: ConfigService) {}

  private getApiKey(): string {
    const key = this.configService.get<string>('GOOGLE_MAPS_API_KEY')?.trim();
    if (!key) {
      this.logger.error('GOOGLE_MAPS_API_KEY is not configured in backend environment.');
      throw new ForbiddenException({
        error: 'invalid_key',
        message: 'Google Maps API key is not configured on backend server.',
      });
    }
    return key;
  }

  async getDirections(dto: DirectionsDto) {
    const apiKey = this.getApiKey();

    const origin = dto.origin.trim();
    const destination = dto.destination.trim();
    const mode = (dto.mode || 'driving').toLowerCase().trim();
    const waypoints = (dto.waypoints || []).map((w) => w.trim()).filter(Boolean);

    // Build Cache Key
    const cacheKey = `directions:${origin}:${destination}:${waypoints.join('|')}:${mode}`.toLowerCase();
    const cached = googleMapsCache.get(cacheKey);
    if (cached) {
      this.logger.log(`Serving directions from cache for: ${origin} -> ${destination}`);
      return { ...cached, cached: true };
    }

    // Build Query
    const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
    url.searchParams.set('origin', origin);
    url.searchParams.set('destination', destination);
    url.searchParams.set('mode', mode);
    url.searchParams.set('key', apiKey);

    if (waypoints.length > 0) {
      url.searchParams.set('waypoints', waypoints.join('|'));
    }

    let response: Response;
    try {
      this.logger.log(`Calling Google Directions API: ${origin} -> ${destination}`);
      response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
    } catch (err: any) {
      this.logger.error(`Network error calling Google Directions API: ${err.message}`);
      throw new BadGatewayException({
        error: 'google_api_unreachable',
        message: 'Unable to reach Google Maps Directions API.',
      });
    }

    if (!response.ok) {
      this.logger.error(`Google Directions API HTTP error: ${response.status} ${response.statusText}`);
      throw new BadGatewayException({
        error: 'google_api_unreachable',
        message: `Google Directions API returned HTTP ${response.status}`,
      });
    }

    const data = await response.json();

    switch (data.status) {
      case 'OK':
        googleMapsCache.set(cacheKey, data, DIRECTIONS_TTL_MS);
        return { ...data, cached: false };

      case 'ZERO_RESULTS':
      case 'NOT_FOUND':
        this.logger.warn(`Google Directions returned ${data.status} for: ${origin} -> ${destination}`);
        throw new NotFoundException({
          error: 'no_route_found',
          message: data.error_message || 'No route found between the specified locations.',
        });

      case 'OVER_QUERY_LIMIT':
      case 'OVER_DAILY_LIMIT':
        this.logger.error(`Google Directions quota exceeded: ${data.error_message}`);
        throw new HttpException(
          {
            error: 'quota_exceeded',
            message: data.error_message || 'Google Maps API quota exceeded.',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );

      case 'REQUEST_DENIED':
        this.logger.error(`Google Directions request denied: ${data.error_message}`);
        throw new ForbiddenException({
          error: 'invalid_key',
          message: data.error_message || 'Google Maps API request denied or invalid API key.',
        });

      case 'INVALID_REQUEST':
        this.logger.warn(`Google Directions invalid request: ${data.error_message}`);
        throw new BadRequestException({
          error: 'invalid_request',
          message: data.error_message || 'Invalid directions request parameters.',
        });

      default:
        this.logger.error(`Google Directions unknown status: ${data.status} - ${data.error_message}`);
        throw new BadGatewayException({
          error: 'google_api_error',
          message: data.error_message || `Google Maps API error: ${data.status}`,
        });
    }
  }

  async getGeocode(address: string) {
    const cleanAddress = address?.trim();
    if (!cleanAddress) {
      throw new BadRequestException({
        error: 'invalid_request',
        message: 'Address query parameter is required.',
      });
    }

    const apiKey = this.getApiKey();

    const cacheKey = `geocode:${cleanAddress.toLowerCase()}`;
    const cached = googleMapsCache.get(cacheKey);
    if (cached) {
      this.logger.log(`Serving geocode from cache for: ${cleanAddress}`);
      return { ...cached, cached: true };
    }

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', cleanAddress);
    url.searchParams.set('key', apiKey);

    let response: Response;
    try {
      this.logger.log(`Calling Google Geocoding API for: ${cleanAddress}`);
      response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
    } catch (err: any) {
      this.logger.error(`Network error calling Google Geocoding API: ${err.message}`);
      throw new BadGatewayException({
        error: 'google_api_unreachable',
        message: 'Unable to reach Google Maps Geocoding API.',
      });
    }

    if (!response.ok) {
      this.logger.error(`Google Geocoding API HTTP error: ${response.status} ${response.statusText}`);
      throw new BadGatewayException({
        error: 'google_api_unreachable',
        message: `Google Geocoding API returned HTTP ${response.status}`,
      });
    }

    const data = await response.json();

    switch (data.status) {
      case 'OK':
        googleMapsCache.set(cacheKey, data, GEOCODE_TTL_MS);
        return { ...data, cached: false };

      case 'ZERO_RESULTS':
        this.logger.warn(`Google Geocoding returned ZERO_RESULTS for: ${cleanAddress}`);
        throw new NotFoundException({
          error: 'no_results',
          message: data.error_message || `No geocoding results found for "${cleanAddress}".`,
        });

      case 'OVER_QUERY_LIMIT':
      case 'OVER_DAILY_LIMIT':
        this.logger.error(`Google Geocoding quota exceeded: ${data.error_message}`);
        throw new HttpException(
          {
            error: 'quota_exceeded',
            message: data.error_message || 'Google Maps API quota exceeded.',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );

      case 'REQUEST_DENIED':
        this.logger.error(`Google Geocoding request denied: ${data.error_message}`);
        throw new ForbiddenException({
          error: 'invalid_key',
          message: data.error_message || 'Google Maps API request denied or invalid API key.',
        });

      case 'INVALID_REQUEST':
        this.logger.warn(`Google Geocoding invalid request: ${data.error_message}`);
        throw new BadRequestException({
          error: 'invalid_request',
          message: data.error_message || 'Invalid geocode request parameters.',
        });

      default:
        this.logger.error(`Google Geocoding unknown status: ${data.status} - ${data.error_message}`);
        throw new BadGatewayException({
          error: 'google_api_error',
          message: data.error_message || `Google Maps API error: ${data.status}`,
        });
    }
  }
}
