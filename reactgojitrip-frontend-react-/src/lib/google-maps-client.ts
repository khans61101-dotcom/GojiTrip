import { API_BASE_URL } from "./api";

// ============================================================
// TYPES: DIRECTIONS API
// ============================================================

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export interface DirectionsDistance {
  text: string;
  value: number; // in meters
}

export interface DirectionsDuration {
  text: string;
  value: number; // in seconds
}

export interface DirectionsStep {
  distance: DirectionsDistance;
  duration: DirectionsDuration;
  start_location: LatLngLiteral;
  end_location: LatLngLiteral;
  html_instructions?: string;
  travel_mode?: string;
  maneuver?: string;
  polyline?: {
    points: string;
  };
}

export interface DirectionsLeg {
  distance: DirectionsDistance;
  duration: DirectionsDuration;
  start_address: string;
  end_address: string;
  start_location: LatLngLiteral;
  end_location: LatLngLiteral;
  steps: DirectionsStep[];
  via_waypoint?: any[];
}

export interface DirectionsRoute {
  summary: string;
  legs: DirectionsLeg[];
  overview_polyline: {
    points: string;
  };
  bounds?: {
    northeast: LatLngLiteral;
    southwest: LatLngLiteral;
  };
  copyrights?: string;
  warnings?: string[];
  waypoint_order?: number[];
}

export interface DirectionsResponse {
  status: string;
  routes: DirectionsRoute[];
  geocoded_waypoints?: any[];
  cached?: boolean;
}

// ============================================================
// TYPES: GEOCODING API
// ============================================================

export interface GeocodeAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GeocodeGeometry {
  location: LatLngLiteral;
  location_type?: string;
  viewport?: {
    northeast: LatLngLiteral;
    southwest: LatLngLiteral;
  };
}

export interface GeocodeResult {
  formatted_address: string;
  geometry: GeocodeGeometry;
  place_id: string;
  address_components?: GeocodeAddressComponent[];
  types?: string[];
}

export interface GeocodeResponse {
  status: string;
  results: GeocodeResult[];
  cached?: boolean;
}

// ============================================================
// ERROR HANDLING
// ============================================================

export class GoogleApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string = "unknown_error", status: number = 500) {
    super(message);
    this.name = "GoogleApiError";
    this.code = code;
    this.status = status;
  }
}

// ============================================================
// CLIENT FUNCTIONS (PROXY VIA BACKEND)
// ============================================================

/**
 * Fetch directions via backend proxy (Google Directions API).
 * NEVER calls googleapis.com directly.
 */
export async function getDirections(
  origin: string,
  destination: string,
  waypoints?: string[]
): Promise<DirectionsResponse> {
  const url = `${API_BASE_URL}/google/directions`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin: origin.trim(),
        destination: destination.trim(),
        waypoints: waypoints?.filter(Boolean) || [],
        mode: "driving",
      }),
    });
  } catch (err: any) {
    throw new GoogleApiError(
      "Unable to connect to route service. Please check your internet connection.",
      "google_api_unreachable",
      502
    );
  }

  if (!response.ok) {
    let errorJson: any = null;
    try {
      errorJson = await response.json();
    } catch {
      // ignore
    }

    const code = errorJson?.error || errorJson?.errorDetails || "api_error";
    const message =
      errorJson?.message || `Failed to fetch route directions (${response.status})`;

    throw new GoogleApiError(message, code, response.status);
  }

  const data: DirectionsResponse = await response.json();
  return data;
}

/**
 * Geocode an address via backend proxy (Google Geocoding API).
 * NEVER calls googleapis.com directly.
 */
export async function geocode(address: string): Promise<GeocodeResponse> {
  const clean = address.trim();
  if (!clean) {
    throw new GoogleApiError("Address is required for geocoding.", "invalid_request", 400);
  }

  const url = `${API_BASE_URL}/google/geocode?address=${encodeURIComponent(clean)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (err: any) {
    throw new GoogleApiError(
      "Unable to connect to geocoding service.",
      "google_api_unreachable",
      502
    );
  }

  if (!response.ok) {
    let errorJson: any = null;
    try {
      errorJson = await response.json();
    } catch {
      // ignore
    }

    const code = errorJson?.error || errorJson?.errorDetails || "api_error";
    const message =
      errorJson?.message || `Failed to geocode address (${response.status})`;

    throw new GoogleApiError(message, code, response.status);
  }

  const data: GeocodeResponse = await response.json();
  return data;
}
