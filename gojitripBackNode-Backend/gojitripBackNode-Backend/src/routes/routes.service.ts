import { Injectable, BadRequestException } from '@nestjs/common';

import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PlanRouteDto } from './dto/plan-route.dto';

import { PrismaService } from '../prisma/prisma.service';

// ============================================================
// ROUTE LOCATION
// ============================================================

export interface RouteLocation {
  placeId?: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

// ============================================================
// ROUTE STOP
// ============================================================

export interface RouteStop {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;

  type:
    | 'source'
    | 'stop'
    | 'rest'
    | 'food'
    | 'fuel'
    | 'sightseeing'
    | 'hotel'
    | 'destination';

  subtitle?: string;
  details?: string;

  distanceFromPrevious?: number | string;
  durationFromPrevious?: string;

  recommended?: boolean;
  sequence?: number;
  progressPercent?: number;
}

// ============================================================
// ROUTE PLAN RESPONSE
// ============================================================

export interface RoutePlanResponse {
  source: RouteLocation;
  destination: RouteLocation;

  date?: string;
  travellers?: number;

  distance?: number | string;
  duration?: string;

  polyline?: string;

  stops: RouteStop[];
  intermediateStops: RouteStop[];
  route: RouteStop[];

  message?: string;
}

// ============================================================
// GOOGLE ROUTES API V2 TYPES
// ============================================================

interface GoogleLatLng {
  latitude?: number;
  longitude?: number;
}

interface GoogleLocationV2 {
  latLng?: GoogleLatLng;
}

interface GooglePolylineV2 {
  encodedPolyline?: string;
}

interface GoogleRouteStepV2 {
  distanceMeters?: number;

  staticDuration?: string;

  duration?: string;

  startLocation?: GoogleLocationV2;

  endLocation?: GoogleLocationV2;

  polyline?: GooglePolylineV2;

  navigationInstruction?: {
    maneuver?: string;
    instructions?: string;
  };

  travelMode?: string;
}

interface GoogleRouteLegV2 {
  distanceMeters?: number;

  duration?: string;

  staticDuration?: string;

  startLocation?: GoogleLocationV2;

  endLocation?: GoogleLocationV2;

  steps?: GoogleRouteStepV2[];

  polyline?: GooglePolylineV2;
}

interface GoogleRouteV2 {
  distanceMeters?: number;

  duration?: string;

  staticDuration?: string;

  polyline?: GooglePolylineV2;

  legs?: GoogleRouteLegV2[];

  description?: string;

  warnings?: string[];
}

interface GoogleRoutesV2Response {
  routes?: GoogleRouteV2[];

  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: unknown[];
  };
}

// ============================================================
// GOOGLE DIRECTIONS FALLBACK TYPES
// ============================================================

interface GoogleDirectionsLocation {
  lat: number;
  lng: number;
}

interface GoogleDirectionsStep {
  distance?: {
    text?: string;
    value?: number;
  };

  duration?: {
    text?: string;
    value?: number;
  };

  start_location?: GoogleDirectionsLocation;
  end_location?: GoogleDirectionsLocation;

  start_address?: string;
  end_address?: string;

  html_instructions?: string;
}

interface GoogleDirectionsLeg {
  distance?: {
    text?: string;
    value?: number;
  };

  duration?: {
    text?: string;
    value?: number;
  };

  start_address?: string;
  end_address?: string;

  start_location?: GoogleDirectionsLocation;
  end_location?: GoogleDirectionsLocation;

  steps?: GoogleDirectionsStep[];
}

interface GoogleDirectionsRoute {
  legs?: GoogleDirectionsLeg[];

  overview_polyline?: {
    points?: string;
  };
}

interface GoogleDirectionsResponse {
  status?: string;

  error_message?: string;

  routes?: GoogleDirectionsRoute[];
}

// ============================================================
// INTERNAL DYNAMIC LOCATION
// ============================================================

interface DynamicRoutePoint {
  latitude: number;
  longitude: number;

  address?: string;
  name?: string;
  placeId?: string;

  distanceFromPrevious?: number | string;
  durationFromPrevious?: string;
}

// ============================================================
// SERVICE
// ============================================================

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================================
  // CREATE ROUTE
  // ==========================================================

  create(createRouteDto: CreateRouteDto) {
    return this.prisma.route.create({
      data: createRouteDto as any,
    });
  }

  // ==========================================================
  // FIND ALL
  // ==========================================================

  findAll() {
    return this.prisma.route.findMany();
  }

  // ==========================================================
  // FIND ONE
  // ==========================================================

  findOne(id: number) {
    return this.prisma.route.findUnique({
      where: {
        id,
      },
    });
  }

  // ==========================================================
  // UPDATE
  // ==========================================================

  update(id: number, updateRouteDto: UpdateRouteDto) {
    return this.prisma.route.update({
      where: {
        id,
      },
      data: updateRouteDto as any,
    });
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  remove(id: number) {
    return this.prisma.route.delete({
      where: {
        id,
      },
    });
  }

  // ==========================================================
  // PLAN COMPLETE DYNAMIC ROUTE
  //
  // POST /api/v1/routes/plan
  //
  // SOURCE
  //   ↓
  // GOOGLE ACTUAL ROAD ROUTE
  //   ↓
  // ROUTE STEPS
  //   ↓
  // REVERSE GEOCODING
  //   ↓
  // VILLAGES / TOWNS / LOCALITIES
  //   ↓
  // DESTINATION
  // ==========================================================

  async planRoute(dto: PlanRouteDto): Promise<RoutePlanResponse> {
    // ========================================================
    // VALIDATE SOURCE
    // ========================================================

    if (!dto.source) {
      throw new BadRequestException('Source is required.');
    }

    if (!dto.source.name || !dto.source.name.trim()) {
      throw new BadRequestException('Source name is required.');
    }

    // ========================================================
    // VALIDATE DESTINATION
    // ========================================================

    if (!dto.destination) {
      throw new BadRequestException('Destination is required.');
    }

    if (!dto.destination.name || !dto.destination.name.trim()) {
      throw new BadRequestException('Destination name is required.');
    }

    // ========================================================
    // NORMALIZE SOURCE
    // ========================================================

    const source: RouteLocation = {
      placeId: dto.source.placeId,
      name: dto.source.name.trim(),
      address: dto.source.address,
      latitude: dto.source.latitude,
      longitude: dto.source.longitude,
    };

    // ========================================================
    // NORMALIZE DESTINATION
    // ========================================================

    const destination: RouteLocation = {
      placeId: dto.destination.placeId,
      name: dto.destination.name.trim(),
      address: dto.destination.address,
      latitude: dto.destination.latitude,
      longitude: dto.destination.longitude,
    };

    console.log('====================================================');

    console.log('DYNAMIC ROUTE REQUEST');

    console.log('SOURCE:', source);

    console.log('DESTINATION:', destination);

    console.log('====================================================');

    // ========================================================
    // GET GOOGLE ROUTE
    // ========================================================

    const googleRoute = await this.getGoogleRoute(source, destination);

    // ========================================================
    // GOOGLE ROUTE NOT AVAILABLE
    // ========================================================

    if (!googleRoute) {
      console.warn('Google route unavailable. Returning safe fallback.');

      const sourceStop = this.createSourceStop(source);

      const destinationStop = this.createDestinationStop(destination, 2);

      const basicStops: RouteStop[] = [sourceStop, destinationStop];

      return {
        source,
        destination,

        date: dto.date,

        travellers: dto.travellers,

        stops: basicStops,

        intermediateStops: [],

        route: basicStops,

        message: 'Route created, but Google Maps route data was not available.',
      };
    }

    // ========================================================
    // ROUTE DATA
    // ========================================================

    const route = googleRoute.route;

    const legs = route.legs || [];

    // ========================================================
    // TOTAL DISTANCE
    // ========================================================

    const totalDistanceMeters =
      typeof route.distanceMeters === 'number'
        ? route.distanceMeters
        : legs.reduce((total, leg) => total + (leg.distanceMeters || 0), 0);

    const totalDistance = this.formatDistance(totalDistanceMeters);

    // ========================================================
    // TOTAL DURATION
    // ========================================================

    const durationString =
      route.duration || legs.map((leg) => leg.duration || '0s').join();

    const totalDurationSeconds = this.parseGoogleDuration(durationString);

    const totalDuration = this.formatDuration(totalDurationSeconds);

    // ========================================================
    // POLYLINE
    // ========================================================

    const polyline = route.polyline?.encodedPolyline;

    // ========================================================
    // EXTRACT DYNAMIC POINTS
    // ========================================================

    const dynamicPoints = this.extractRoutePoints(legs, source, destination);

    console.log(`Google route steps found: ${dynamicPoints.length}`);

    // ========================================================
    // GEOCODE ROUTE POINTS
    // ========================================================

    const intermediateStops = await this.buildDynamicStops(
      dynamicPoints,
      source,
      destination,
    );

    // ========================================================
    // SOURCE
    // ========================================================

    const sourceStop = this.createSourceStop(source);

    // ========================================================
    // DESTINATION
    // ========================================================

    const destinationStop = this.createDestinationStop(
      destination,
      intermediateStops.length + 2,
    );

    // ========================================================
    // COMPLETE ROUTE
    // ========================================================

    const allStops: RouteStop[] = [
      sourceStop,
      ...intermediateStops,
      destinationStop,
    ];

    // ========================================================
    // RE-SEQUENCE
    // ========================================================

    const finalStops = allStops.map((stop, index) => ({
      ...stop,

      sequence: index + 1,

      id: String(index + 1).padStart(2, '0'),

      progressPercent:
        allStops.length > 1
          ? Math.round((index / (allStops.length - 1)) * 100)
          : 100,
    }));

    // ========================================================
    // INTERMEDIATE STOPS
    // ========================================================

    const finalIntermediateStops = finalStops.filter(
      (stop) => stop.type !== 'source' && stop.type !== 'destination',
    );

    // ========================================================
    // LOG
    // ========================================================

    console.log('====================================================');

    console.log('DYNAMIC ROUTE STOPS:');

    finalStops.forEach((stop) => {
      console.log(`${stop.sequence}. ${stop.name} (${stop.type})`);
    });

    console.log('====================================================');

    // ========================================================
    // RESPONSE
    // ========================================================

    return {
      source,

      destination,

      date: dto.date,

      travellers: dto.travellers,

      distance: totalDistance,

      duration: totalDuration,

      polyline,

      stops: finalStops,

      intermediateStops: finalIntermediateStops,

      route: finalStops,

      message: 'Dynamic Google route generated successfully.',
    };
  }

  // ==========================================================
  // GOOGLE ROUTES API V2
  // ==========================================================

  private async getGoogleRoute(
    source: RouteLocation,
    destination: RouteLocation,
  ): Promise<{
    route: GoogleRouteV2;
  } | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error(
        'GOOGLE_MAPS_API_KEY is not configured in environment variables.',
      );

      return await this.getGoogleDirectionsFallback(
        source,
        destination,
        '', // apiKey is empty, fallback will fail but it's okay for now
      );
    }

    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

    // ========================================================
    // ORIGIN
    // ========================================================

    const origin = this.buildRoutesApiWaypoint(source);

    // ========================================================
    // DESTINATION
    // ========================================================

    const destinationValue = this.buildRoutesApiWaypoint(destination);

    // ========================================================
    // GOOGLE ROUTES V2 REQUEST
    // ========================================================

    const body = {
      origin,

      destination: destinationValue,

      travelMode: 'DRIVE',

      routingPreference: 'TRAFFIC_UNAWARE',

      computeAlternativeRoutes: false,

      languageCode: 'en',

      units: 'METRIC',
    };

    console.log('====================================================');

    console.log('Google Routes API v2 request started.');

    console.log('Google Routes Request Body:', JSON.stringify(body, null, 2));

    console.log('====================================================');

    try {
      const response = await fetch(url, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',

          'X-Goog-Api-Key': apiKey,

          'X-Goog-FieldMask': [
            'routes.distanceMeters',
            'routes.duration',
            'routes.polyline.encodedPolyline',
            'routes.legs.distanceMeters',
            'routes.legs.duration',
            'routes.legs.startLocation',
            'routes.legs.endLocation',
            'routes.legs.steps.distanceMeters',
            'routes.legs.steps.staticDuration',
            'routes.legs.steps.startLocation',
            'routes.legs.steps.endLocation',
          ].join(','),
        },

        body: JSON.stringify(body),
      });

      const rawText = await response.text();

      let data: GoogleRoutesV2Response;

      try {
        data = JSON.parse(rawText);
      } catch {
        console.error('Google Routes API returned non-JSON response:', rawText);

        return await this.getGoogleDirectionsFallback(
          source,
          destination,
          apiKey,
        );
      }

      // ======================================================
      // ERROR
      // ======================================================

      if (!response.ok) {
        console.error(
          'Google Routes API error:',
          response.status,
          JSON.stringify(data, null, 2),
        );

        // Try legacy Directions API as fallback
        return await this.getGoogleDirectionsFallback(
          source,
          destination,
          apiKey,
        );
      }

      // ======================================================
      // NO ROUTE
      // ======================================================

      if (!data.routes || data.routes.length === 0) {
        console.error('Google Routes API returned no routes.');

        return await this.getGoogleDirectionsFallback(
          source,
          destination,
          apiKey,
        );
      }

      const route = data.routes[0];

      console.log('Google Routes API success.');

      console.log('Distance:', route.distanceMeters);

      console.log('Duration:', route.duration);

      console.log('Legs:', route.legs?.length || 0);

      return {
        route,
      };
    } catch (error) {
      console.error('Google Routes API request failed:', error);

      return await this.getGoogleDirectionsFallback(
        source,
        destination,
        apiKey,
      );
    }
  }

  // ==========================================================
  // BUILD ROUTES API WAYPOINT
  // ==========================================================

  private buildRoutesApiWaypoint(location: RouteLocation) {
    // Prefer coordinates because the frontend already
    // provides them from Places API.

    if (
      typeof location.latitude === 'number' &&
      Number.isFinite(location.latitude) &&
      typeof location.longitude === 'number' &&
      Number.isFinite(location.longitude)
    ) {
      return {
        location: {
          latLng: {
            latitude: location.latitude,

            longitude: location.longitude,
          },
        },
      };
    }

    // Fallback to address.

    if (location.address && location.address.trim()) {
      return {
        address: location.address.trim(),
      };
    }

    // Final fallback to name.

    return {
      address: location.name.trim(),
    };
  }

  // ==========================================================
  // GOOGLE DIRECTIONS API FALLBACK
  // ==========================================================

  private async getGoogleDirectionsFallback(
    source: RouteLocation,
    destination: RouteLocation,
    apiKey: string,
  ): Promise<{
    route: GoogleRouteV2;
  } | null> {
    console.warn('Trying Google Directions API fallback...');

    const origin = this.buildDirectionsLocation(source);

    const destinationValue = this.buildDirectionsLocation(destination);

    const params = new URLSearchParams();

    params.set('origin', origin);

    params.set('destination', destinationValue);

    params.set('mode', 'driving');

    params.set('language', 'en');

    params.set('region', 'np');

    params.set('key', apiKey);

    const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;

    try {
      const response = await fetch(url);

      const data = (await response.json()) as GoogleDirectionsResponse;

      if (
        !response.ok ||
        data.status !== 'OK' ||
        !data.routes ||
        data.routes.length === 0
      ) {
        console.error(
          'Google Directions fallback failed:',
          response.status,
          data.status,
          data.error_message,
        );

        return null;
      }

      const googleRoute = data.routes[0];

      const legs = googleRoute.legs || [];

      const mappedLegs: GoogleRouteLegV2[] = legs.map((leg) => ({
        distanceMeters: leg.distance?.value,

        duration: leg.duration ? `${leg.duration.value}s` : undefined,

        startLocation: leg.start_location
          ? {
              latLng: {
                latitude: leg.start_location.lat,

                longitude: leg.start_location.lng,
              },
            }
          : undefined,

        endLocation: leg.end_location
          ? {
              latLng: {
                latitude: leg.end_location.lat,

                longitude: leg.end_location.lng,
              },
            }
          : undefined,

        steps: (leg.steps || []).map((step) => ({
          distanceMeters: step.distance?.value,

          staticDuration: step.duration ? `${step.duration.value}s` : undefined,

          startLocation: step.start_location
            ? {
                latLng: {
                  latitude: step.start_location.lat,

                  longitude: step.start_location.lng,
                },
              }
            : undefined,

          endLocation: step.end_location
            ? {
                latLng: {
                  latitude: step.end_location.lat,

                  longitude: step.end_location.lng,
                },
              }
            : undefined,
        })),
      }));

      const totalDistance = legs.reduce(
        (total, leg) => total + (leg.distance?.value || 0),
        0,
      );

      const totalDuration = legs.reduce(
        (total, leg) => total + (leg.duration?.value || 0),
        0,
      );

      console.log('Google Directions fallback success.');

      return {
        route: {
          distanceMeters: totalDistance,

          duration: `${totalDuration}s`,

          polyline: googleRoute.overview_polyline?.points
            ? {
                encodedPolyline: googleRoute.overview_polyline.points,
              }
            : undefined,

          legs: mappedLegs,
        },
      };
    } catch (error) {
      console.error('Google Directions fallback request failed:', error);

      return null;
    }
  }

  // ==========================================================
  // DIRECTIONS API LOCATION
  // ==========================================================

  private buildDirectionsLocation(location: RouteLocation): string {
    if (
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number'
    ) {
      return `${location.latitude},${location.longitude}`;
    }

    if (location.address && location.address.trim()) {
      return location.address.trim();
    }

    return location.name.trim();
  }

  // ==========================================================
  // EXTRACT ROUTE POINTS
  //
  // Google Routes API v2:
  //
  // step.endLocation.latLng.latitude
  // step.endLocation.latLng.longitude
  // ==========================================================

  private extractRoutePoints(
    legs: GoogleRouteLegV2[],
    source: RouteLocation,
    destination: RouteLocation,
  ): DynamicRoutePoint[] {
    const points: DynamicRoutePoint[] = [];

    console.log(`Total legs: ${legs.length}`);
    for (const leg of legs) {
      const steps = leg.steps || [];
      console.log(`Steps in leg: ${steps.length}`);
      for (const step of steps) {
        const location = step.endLocation?.latLng;

        if (!location) {
          console.log('Step missing endLocation');
          continue;
        }

        points.push({
          latitude: location.latitude!,
          longitude: location.longitude!,
          distanceFromPrevious:
            typeof step.distanceMeters === 'number'
              ? this.formatDistance(step.distanceMeters)
              : undefined,
          durationFromPrevious: step.staticDuration
            ? this.formatGoogleDuration(step.staticDuration)
            : undefined,
        });
      }
    }

    console.log(`Total points extracted: ${points.length}`);

    // ========================================================
    // NO POINTS
    // ========================================================

    if (points.length === 0) {
      return [];
    }

    // ========================================================
    // REMOVE POINTS TOO CLOSE TO SOURCE
    // ========================================================

    const filtered = points.filter((point) => {
      if (
        typeof source.latitude !== 'number' ||
        typeof source.longitude !== 'number'
      ) {
        return true;
      }

      const distance = this.calculateDistanceKm(
        source.latitude,
        source.longitude,
        point.latitude,
        point.longitude,
      );

      return distance > 0.1; // Reduced from 1 to 0.1
    });

    // ========================================================
    // REMOVE POINTS TOO CLOSE TO DESTINATION
    // ========================================================

    const filteredDestination = filtered.filter((point) => {
      if (
        typeof destination.latitude !== 'number' ||
        typeof destination.longitude !== 'number'
      ) {
        return true;
      }

      const distance = this.calculateDistanceKm(
        destination.latitude,
        destination.longitude,
        point.latitude,
        point.longitude,
      );

      return distance > 0.1; // Reduced from 1 to 0.1
    });

    // ========================================================
    // FALLBACK IF ALL FILTERED
    // ========================================================

    const finalPoints =
      filteredDestination.length > 0 ? filteredDestination : points; // Use unfiltered if all filtered out

    // ========================================================
    // SAMPLE MAX 8
    // ========================================================

    const maxPoints = 8;

    if (finalPoints.length <= maxPoints) {
      return finalPoints;
    }

    const sampled: DynamicRoutePoint[] = [];

    const interval = Math.ceil(finalPoints.length / (maxPoints + 1));

    for (
      let index = interval - 1;
      index < finalPoints.length;
      index += interval
    ) {
      const point = finalPoints[index];

      if (!point) {
        continue;
      }

      sampled.push(point);

      if (sampled.length >= maxPoints) {
        break;
      }
    }

    return sampled;
  }

  // ==========================================================
  // BUILD DYNAMIC STOPS
  // ==========================================================

  private async buildDynamicStops(
    points: DynamicRoutePoint[],
    source: RouteLocation,
    destination: RouteLocation,
  ): Promise<RouteStop[]> {
    if (points.length === 0) {
      return [];
    }

    const result: RouteStop[] = [];

    const seen = new Set<string>();

    for (let index = 0; index < points.length; index++) {
      const point = points[index];

      if (!point) {
        continue;
      }

      // ======================================================
      // REVERSE GEOCODE
      // ======================================================

      const geocoded = await this.reverseGeocode(
        point.latitude,
        point.longitude,
      );

      // ======================================================
      // LOCATION NAME
      // ======================================================

      const locationName =
        geocoded?.name || point.name || this.extractAddressName(point.address);

      if (!locationName) {
        continue;
      }

      // ======================================================
      // NORMALIZE
      // ======================================================

      const normalizedName = locationName.trim().toLowerCase();

      // ======================================================
      // SKIP SOURCE
      // ======================================================

      if (this.isSamePlace(normalizedName, source.name)) {
        continue;
      }

      // ======================================================
      // SKIP DESTINATION
      // ======================================================

      if (this.isSamePlace(normalizedName, destination.name)) {
        continue;
      }

      // ======================================================
      // DUPLICATE
      // ======================================================

      if (seen.has(normalizedName)) {
        continue;
      }

      seen.add(normalizedName);

      // ======================================================
      // CREATE STOP
      // ======================================================

      const stop: RouteStop = {
        id: String(result.length + 2).padStart(2, '0'),

        name: locationName,

        address: geocoded?.address || point.address,

        latitude: geocoded?.latitude ?? point.latitude,

        longitude: geocoded?.longitude ?? point.longitude,

        placeId: geocoded?.placeId,

        type: 'stop',

        subtitle: 'Next Stop',

        details: 'A location along your actual driving route.',

        distanceFromPrevious: point.distanceFromPrevious,

        durationFromPrevious: point.durationFromPrevious,

        recommended: true,
      };

      result.push(stop);
    }

    return result;
  }

  // ==========================================================
  // REVERSE GEOCODING
  // ==========================================================

  private async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<{
    name: string;
    address?: string;
    placeId?: string;
    latitude: number;
    longitude: number;
  } | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return null;
    }

    const params = new URLSearchParams();

    params.set('latlng', `${latitude},${longitude}`);

    params.set('language', 'en');

    params.set('region', 'np');

    params.set('key', apiKey);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;

    console.log('REVERSE GEOCODE URL:', url);
    try {
      const response = await fetch(url);

      console.log('REVERSE GEOCODE RESPONSE STATUS:', response.status);

      if (!response.ok) {
        console.error(
          'Google Geocoding HTTP error:',
          response.status,
          await response.text(),
        );

        return null;
      }

      const data = await response.json();

      console.log('REVERSE GEOCODE DATA STATUS:', data.status);

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        console.warn(
          'Google Geocoding returned:',
          data.status,
          data.error_message,
        );

        return null;
      }

      const bestResult = this.findBestGeocodeResult(data.results);

      if (!bestResult) {
        return null;
      }

      const name = this.extractLocalityName(bestResult);

      if (!name) {
        return null;
      }

      const location = bestResult.geometry?.location;

      return {
        name,

        address: bestResult.formatted_address,

        placeId: bestResult.place_id,

        latitude: location?.lat ?? latitude,

        longitude: location?.lng ?? longitude,
      };
    } catch (error) {
      console.error('Google reverse geocoding failed:', error);

      return null;
    }
  }

  // ==========================================================
  // BEST GEOCODING RESULT
  // ==========================================================

  private findBestGeocodeResult(results: any[]): any | null {
    const priorityTypes = [
      'locality',
      'postal_town',
      'sublocality',
      'sublocality_level_1',
      'administrative_area_level_3',
      'administrative_area_level_2',
    ];

    for (const type of priorityTypes) {
      const found = results.find(
        (result) =>
          result.address_components?.some((component: any) =>
            component.types?.includes(type),
          ) === true,
      );

      if (found) {
        return found;
      }
    }

    return results[0] || null;
  }

  // ==========================================================
  // EXTRACT LOCALITY NAME
  // ==========================================================

  private extractLocalityName(result: any): string | null {
    const components = result.address_components || [];

    const priorityTypes = [
      'locality',
      'postal_town',
      'sublocality',
      'sublocality_level_1',
      'administrative_area_level_3',
      'administrative_area_level_2',
    ];

    for (const type of priorityTypes) {
      const component = components.find((item: any) =>
        item.types?.includes(type),
      );

      if (component?.long_name) {
        return component.long_name;
      }
    }

    // ========================================================
    // FALLBACK
    // ========================================================

    const fallback = components.find(
      (component: any) =>
        component.long_name &&
        !component.types?.includes('country') &&
        !component.types?.includes('postal_code'),
    );

    return fallback?.long_name || null;
  }

  // ==========================================================
  // ADDRESS FALLBACK
  // ==========================================================

  private extractAddressName(address?: string): string | null {
    if (!address || !address.trim()) {
      return null;
    }

    const parts = address
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      return null;
    }

    if (parts.length >= 2) {
      return parts[parts.length - 2] || null;
    }

    return parts[0] || null;
  }

  // ==========================================================
  // CREATE SOURCE STOP
  // ==========================================================

  private createSourceStop(source: RouteLocation): RouteStop {
    return {
      id: '01',

      name: source.name,

      address: source.address,

      latitude: source.latitude,

      longitude: source.longitude,

      placeId: source.placeId,

      type: 'source',

      subtitle: 'Starting Point',

      details: 'Start your trip from here.',

      recommended: true,

      sequence: 1,

      progressPercent: 0,
    };
  }

  // ==========================================================
  // CREATE DESTINATION STOP
  // ==========================================================

  private createDestinationStop(
    destination: RouteLocation,
    idNumber: number = 2,
  ): RouteStop {
    return {
      id: String(idNumber).padStart(2, '0'),

      name: destination.name,

      address: destination.address,

      latitude: destination.latitude,

      longitude: destination.longitude,

      placeId: destination.placeId,

      type: 'destination',

      subtitle: 'Destination',

      details: 'Your final destination.',

      recommended: true,

      sequence: idNumber,

      progressPercent: 100,
    };
  }

  // ==========================================================
  // GOOGLE DURATION PARSER
  //
  // Examples:
  //  "123s"
  //  "123.5s"
  // ==========================================================

  private parseGoogleDuration(duration?: string): number {
    if (!duration) {
      return 0;
    }

    const match = duration.match(/^([\d.]+)s$/);

    if (!match) {
      return 0;
    }

    const seconds = Number(match[1]);

    return Number.isFinite(seconds) ? Math.round(seconds) : 0;
  }

  // ==========================================================
  // FORMAT GOOGLE DURATION
  // ==========================================================

  private formatGoogleDuration(duration?: string): string | undefined {
    const seconds = this.parseGoogleDuration(duration);

    if (seconds <= 0) {
      return undefined;
    }

    return this.formatDuration(seconds);
  }

  // ==========================================================
  // DISTANCE FORMAT
  // ==========================================================

  private formatDistance(meters: number): string {
    if (!meters || meters <= 0) {
      return 'Unknown';
    }

    const kilometers = meters / 1000;

    if (kilometers < 1) {
      return `${Math.round(meters)} m`;
    }

    return `${kilometers.toFixed(1)} km`;
  }

  // ==========================================================
  // DURATION FORMAT
  // ==========================================================

  private formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) {
      return 'Unknown';
    }

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.round((seconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
      return `${hours} hr ${minutes} min`;
    }

    if (hours > 0) {
      return `${hours} hr`;
    }

    return `${minutes} min`;
  }

  // ==========================================================
  // SAME PLACE
  // ==========================================================

  private isSamePlace(first: string, second: string): boolean {
    const a = first.trim().toLowerCase();

    const b = second.trim().toLowerCase();

    return a === b || a.includes(b) || b.includes(a);
  }

  // ==========================================================
  // HAVERSINE DISTANCE
  // ==========================================================

  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const earthRadiusKm = 6371;

    const dLat = this.toRadians(lat2 - lat1);

    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
  }

  // ==========================================================
  // TO RADIANS
  // ==========================================================

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
