import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ============================================================
// GOOGLE AUTOCOMPLETE RESPONSE TYPES
// ============================================================

interface GoogleAutocompleteResponse {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;

      text?: {
        text?: string;
      };

      structuredFormat?: {
        mainText?: {
          text?: string;
        };

        secondaryText?: {
          text?: string;
        };
      };
    };
  }>;
}

// ============================================================
// GOOGLE PLACE DETAILS RESPONSE TYPE
// ============================================================

interface GooglePlaceDetailsResponse {
  id?: string;

  displayName?: {
    text?: string;
    languageCode?: string;
  };

  formattedAddress?: string;

  location?: {
    latitude?: number;
    longitude?: number;
  };
}

// ============================================================
// PLACES SERVICE
// ============================================================

@Injectable()
export class PlacesService {
  constructor(private readonly configService: ConfigService) {}

  // ============================================================
  // GOOGLE API KEY
  // ============================================================

  private get googleApiKey(): string {
    return this.configService.get<string>('GOOGLE_MAPS_API_KEY')?.trim() || '';
  }

  // ============================================================
  // GOOGLE PLACES API URL
  // ============================================================

  private readonly autocompleteUrl =
    'https://places.googleapis.com/v1/places:autocomplete';

  // ============================================================
  // AUTOCOMPLETE
  //
  // GET:
  // /api/v1/places/autocomplete?q=Mustang
  // ============================================================

  async autocomplete(query: string) {
    const apiKey = this.googleApiKey;

    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY is missing from backend environment.');

      throw new InternalServerErrorException(
        'GOOGLE_MAPS_API_KEY is not configured on the backend.',
      );
    }

    const cleanQuery = typeof query === 'string' ? query.trim() : '';

    if (cleanQuery.length < 2) {
      return {
        suggestions: [],
      };
    }

    try {
      const response = await fetch(this.autocompleteUrl, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',

          'X-Goog-Api-Key': apiKey,

          'X-Goog-FieldMask':
            'suggestions.placePrediction.placeId,' +
            'suggestions.placePrediction.text,' +
            'suggestions.placePrediction.structuredFormat',
        },

        body: JSON.stringify({
          input: cleanQuery,

          languageCode: 'en',

          // India + Nepal
          includedRegionCodes: ['in', 'np'],
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error('Google Places Autocomplete Error:', {
          status: response.status,
          response: responseText,
        });

        throw new ServiceUnavailableException(
          'Google location search is currently unavailable.',
        );
      }

      let data: GoogleAutocompleteResponse;

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error(
          'Invalid Google Places Autocomplete response:',
          responseText,
        );

        throw new ServiceUnavailableException(
          'Invalid response received from Google Places.',
        );
      }

      const suggestions = (data.suggestions ?? [])
        .map((item) => {
          const prediction = item.placePrediction;

          if (!prediction) {
            return null;
          }

          const placeId = prediction.placeId;

          if (!placeId) {
            return null;
          }

          const name =
            prediction.structuredFormat?.mainText?.text ||
            prediction.text?.text ||
            '';

          const address =
            prediction.structuredFormat?.secondaryText?.text || '';

          return {
            placeId,
            name,
            address,
          };
        })
        .filter(
          (
            item,
          ): item is {
            placeId: string;
            name: string;
            address: string;
          } => item !== null,
        );

      return {
        suggestions,
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      console.error('Places autocomplete failed:', error);

      throw new ServiceUnavailableException('Unable to search locations.');
    }
  }

  // ============================================================
  // NEARBY SEARCH
  //
  // GET:
  // /api/v1/places/nearby?lat=...&lng=...&radius=...
  // ============================================================

  async nearby(lat: number, lng: number, radius: number) {
    const apiKey = this.googleApiKey;
    if (!apiKey) {
      throw new InternalServerErrorException(
        'GOOGLE_MAPS_API_KEY is not configured.',
      );
    }

    try {
      const url = 'https://places.googleapis.com/v1/places:searchNearby';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.location',
        },
        body: JSON.stringify({
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radius,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new ServiceUnavailableException('Google nearby search failed.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Places nearby failed:', error);
      throw new ServiceUnavailableException(
        'Unable to search nearby locations.',
      );
    }
  }

  // ============================================================
  // PLACE DETAILS
  //
  // GET:
  // /api/v1/places/details?placeId=...
  // ============================================================

  async getDetails(placeId: string) {
    const apiKey = this.googleApiKey;

    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY is missing from backend environment.');

      throw new InternalServerErrorException(
        'GOOGLE_MAPS_API_KEY is not configured on the backend.',
      );
    }

    const cleanPlaceId = typeof placeId === 'string' ? placeId.trim() : '';

    if (!cleanPlaceId) {
      throw new BadRequestException('placeId is required.');
    }

    try {
      const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(
        cleanPlaceId,
      )}`;

      const response = await fetch(url, {
        method: 'GET',

        headers: {
          'X-Goog-Api-Key': apiKey,

          'X-Goog-FieldMask':
            'id,' + 'displayName,' + 'formattedAddress,' + 'location',
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error('Google Places Details Error:', {
          status: response.status,
          response: responseText,
        });

        throw new ServiceUnavailableException(
          'Unable to get location details from Google.',
        );
      }

      let data: GooglePlaceDetailsResponse;

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error('Invalid Google Places Details response:', responseText);

        throw new ServiceUnavailableException(
          'Invalid location details response.',
        );
      }

      const latitude = data.location?.latitude;

      const longitude = data.location?.longitude;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new ServiceUnavailableException(
          'Google did not return valid coordinates for this location.',
        );
      }

      return {
        location: {
          placeId: data.id || cleanPlaceId,

          name: data.displayName?.text || '',

          address: data.formattedAddress || '',

          latitude,

          longitude,
        },
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      console.error('Places details failed:', error);

      throw new ServiceUnavailableException('Unable to get location details.');
    }
  }
}
