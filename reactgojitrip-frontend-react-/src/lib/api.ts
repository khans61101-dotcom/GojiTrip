// ============================================================
// API CONFIG
// ============================================================

const isProduction =
  typeof window !== "undefined" &&
  !window.location.hostname.includes("localhost") &&
  !window.location.hostname.includes("127.0.0.1");

const DEFAULT_API_BASE_URL = isProduction
  ? "https://gojiback.gyaneshindustries.com/api/v1"
  : "http://localhost:8000/api/v1";

const runtimeEnv = (
  globalThis as typeof globalThis & {
    process?: {
      env?: {
        NEXT_PUBLIC_API_BASE_URL?: string;
      };
    };
  }
).process?.env;

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  runtimeEnv?.NEXT_PUBLIC_API_BASE_URL ||
  DEFAULT_API_BASE_URL;


// ============================================================
// API ERROR
// ============================================================

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(
    message: string,
    status: number,
    details: unknown,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}


// ============================================================
// REQUEST OPTIONS
// ============================================================

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};


// ============================================================
// TOKEN
// ============================================================

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    "gojitrip_access_token",
  );
}

function setToken(token: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    localStorage.setItem(
      "gojitrip_access_token",
      token,
    );
  } else {
    localStorage.removeItem(
      "gojitrip_access_token",
    );
  }
}

export {
  getToken,
  setToken,
};


// ============================================================
// API REQUEST
// ============================================================

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(
    options.headers,
  );

  const token =
    options.auth === false
      ? null
      : getToken();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  let body: BodyInit | undefined;

  if (options.body instanceof FormData) {
    body = options.body;
  } else if (
    options.body !== undefined &&
    options.body !== null
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );

    body = JSON.stringify(
      options.body,
    );
  }

  const cleanPath = path.startsWith("/")
    ? path
    : `/${path}`;

  let response: Response;

  try {
    console.log("API REQUEST:", {
      url: `${API_BASE_URL}${cleanPath}`,
      method: options.method || "GET",
      bodyType: typeof body,
      body,
    });
    response = await fetch(
      `${API_BASE_URL}${cleanPath}`,
      {
        ...options,
        headers,
        body,
      },
    );
  } catch (error) {
    console.error(
      "API NETWORK ERROR:",
      error,
    );

    throw new ApiError(
      `Unable to connect to backend at ${API_BASE_URL}`,
      0,
      error,
    );
  }

  const contentType =
    response.headers.get(
      "content-type",
    ) || "";

  const payload =
    contentType.includes(
      "application/json",
    )
      ? await response
          .json()
          .catch(() => null)
      : await response
          .text()
          .catch(() => "");

  if (!response.ok) {
    let message =
      response.statusText ||
      "Request failed";

    if (
      payload &&
      typeof payload === "object"
    ) {
      const data = payload as {
        detail?: unknown;
        message?: unknown;
        error?: unknown;
      };

      if (data.detail) {
        if (
          Array.isArray(
            data.detail,
          )
        ) {
          message = data.detail
            .map((item) => {
              if (
                item &&
                typeof item ===
                  "object" &&
                "msg" in item
              ) {
                return String(
                  (
                    item as {
                      msg?: unknown;
                    }
                  ).msg ?? item,
                );
              }

              return String(item);
            })
            .join(", ");
        } else if (
          typeof data.detail ===
          "object"
        ) {
          message =
            JSON.stringify(
              data.detail,
            );
        } else {
          message = String(
            data.detail,
          );
        }
      } else if (
        data.message
      ) {
        message = String(
          data.message,
        );
      } else if (
        data.error
      ) {
        message = String(
          data.error,
        );
      }
    } else if (
      typeof payload === "string" &&
      payload.trim()
    ) {
      message = payload;
    }

    console.error(
      "API ERROR:",
      {
        status: response.status,
        path: cleanPath,
        payload,
      },
    );

    throw new ApiError(
      message,
      response.status,
      payload,
    );
  }

  return payload as T;
}


// ============================================================
// AUTH
// ============================================================

export async function saveToken(
  token: string,
): Promise<string> {
  setToken(token);

  return token;
}

export function clearToken(): void {
  setToken(null);
}


// ============================================================
// GENERIC HELPERS
// ============================================================

function extractArray<T>(
  response: unknown,
): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (
    response &&
    typeof response ===
      "object"
  ) {
    const data =
      (
        response as {
          data?: unknown;
        }
      ).data;

    if (Array.isArray(data)) {
      return data as T[];
    }
  }

  return [];
}


function isObject(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    value !== null &&
    typeof value ===
      "object" &&
    !Array.isArray(value)
  );
}


function toNumber(
  value: unknown,
): number | undefined {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    const parsed =
      Number(value);

    if (
      Number.isFinite(parsed)
    ) {
      return parsed;
    }
  }

  return undefined;
}


function firstString(
  ...values: unknown[]
): string | undefined {
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return undefined;
}


// ============================================================
// PLACES / LOCATION TYPES
// ============================================================

export type LocationSuggestion = {
  placeId: string;
  name: string;
  address: string;
};


export type LocationData = {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};


// ============================================================
// ROUTE STOP TYPES
// ============================================================

export type RouteStopType =
  | "source"
  | "stop"
  | "rest"
  | "food"
  | "fuel"
  | "sightseeing"
  | "hotel"
  | "destination";


export type RouteStop = {
  id: string;

  name: string;

  address?: string;

  latitude?: number;

  longitude?: number;

  placeId?: string;

  type: RouteStopType;

  subtitle?: string;

  details?: string;

  distanceFromPrevious?:
    | number
    | string;

  durationFromPrevious?: string;

  recommended?: boolean;

  /**
   * Sequence inside the complete route.
   *
   * 1 = source
   * 2...N = intermediate stops
   * last = destination
   */
  sequence?: number;

  /**
   * Optional route progress information
   */
  progressPercent?: number;

  /**
   * Optional Google route information.
   */
  googlePlaceId?: string;

  /**
   * Optional raw backend metadata.
   */
  [key: string]: unknown;
};


// ============================================================
// ROUTE SEARCH DATA
// ============================================================

export type RouteSearchData = {
  source: LocationData;

  destination: LocationData;

  date: string;

  travellers: number;

  intermediateStops?: unknown[];
  viaStops?: unknown[];
  waypoints?: unknown[];
};


// ============================================================
// ROUTE PLAN RESPONSE
// ============================================================

export type RoutePlanResponse = {
  source: LocationData;

  destination: LocationData;

  date?: string;

  travellers?: number;

  distance?: number | string;

  duration?: string;

  stops?: RouteStop[];

  intermediateStops?: RouteStop[];

  route?: RouteStop[];

  /**
   * Google Maps / Routes API style
   * alternatives supported for future backend responses.
   */
  waypoints?: RouteStop[];

  /**
   * Optional route path.
   */
  polyline?: string;

  encodedPolyline?: string;

  /**
   * Backend can send these if available.
   */
  routePath?: unknown[];

  legs?: unknown[];

  message?: string;

  [key: string]: unknown;
};


// ============================================================
// ROUTE STOP NORMALIZER
// ============================================================
//
// Backend se stop ka shape agar:
//
// {
//   name,
//   latitude,
//   longitude
// }
//
// ya:
//
// {
//   location: {
//      lat,
//      lng
//   }
// }
//
// ya:
//
// {
//   coordinates: {
//      latitude,
//      longitude
//   }
// }
//
// aaye, sabko same RouteStop shape mein convert karega.
// ============================================================

function normalizeRouteStop(
  raw: unknown,
  index: number,
  total: number,
): RouteStop | null {
  if (!isObject(raw)) {
    return null;
  }

  const location = isObject(
    raw.location,
  )
    ? raw.location
    : undefined;

  const coordinates =
    isObject(
      raw.coordinates,
    )
      ? raw.coordinates
      : undefined;

  const geometry =
    isObject(
      raw.geometry,
    )
      ? raw.geometry
      : undefined;

  const geometryLocation =
    geometry &&
    isObject(
      geometry.location,
    )
      ? geometry.location
      : undefined;

  const latitude =
    toNumber(
      raw.latitude,
    ) ??
    toNumber(raw.lat) ??
    toNumber(
      location?.latitude,
    ) ??
    toNumber(location?.lat) ??
    toNumber(
      coordinates?.latitude,
    ) ??
    toNumber(coordinates?.lat) ??
    toNumber(
      geometryLocation?.latitude,
    ) ??
    toNumber(
      geometryLocation?.lat,
    );

  const longitude =
    toNumber(
      raw.longitude,
    ) ??
    toNumber(raw.lng) ??
    toNumber(raw.lon) ??
    toNumber(
      location?.longitude,
    ) ??
    toNumber(location?.lng) ??
    toNumber(
      coordinates?.longitude,
    ) ??
    toNumber(coordinates?.lng) ??
    toNumber(
      geometryLocation?.longitude,
    ) ??
    toNumber(
      geometryLocation?.lng,
    );

  const name =
    firstString(
      raw.name,
      raw.title,
      raw.displayName,
      raw.address,
    ) ||
    `Route Stop ${index + 1}`;

  const address =
    firstString(
      raw.address,
      raw.formattedAddress,
      raw.formatted_address,
      location?.address,
    );

  const placeId =
    firstString(
      raw.placeId,
      raw.place_id,
      raw.googlePlaceId,
    );

  const backendType =
    firstString(
      raw.type,
      raw.stopType,
      raw.category,
    );

  let type: RouteStopType =
    "stop";

  switch (
    backendType
      ?.toLowerCase()
      .replace(/[\s_-]/g, "")
  ) {
    case "source":
    case "origin":
      type = "source";
      break;

    case "destination":
      type = "destination";
      break;

    case "food":
    case "restaurant":
      type = "food";
      break;

    case "fuel":
    case "fuelstation":
      type = "fuel";
      break;

    case "hotel":
      type = "hotel";
      break;

    case "sightseeing":
    case "famousplace":
    case "place":
      type = "sightseeing";
      break;

    case "rest":
    case "reststop":
      type = "rest";
      break;

    default:
      type = "stop";
  }

  if (index === 0) {
    type = "source";
  }

  if (
    index === total - 1 &&
    total > 1
  ) {
    type = "destination";
  }

  const distance =
    raw.distanceFromPrevious ??
    raw.distance_from_previous ??
    raw.distance;

  const duration =
    firstString(
      raw.durationFromPrevious,
      raw.duration_from_previous,
      raw.duration,
      raw.travelTime,
      raw.travel_time,
    );

  const subtitle =
    firstString(
      raw.subtitle,
      raw.description,
    );

  const details =
    firstString(
      raw.details,
      raw.information,
      raw.shortDescription,
    );

  return {
    id:
      firstString(
        raw.id,
        raw.placeId,
        raw.place_id,
      ) ||
      `route-stop-${index + 1}`,

    name,

    address,

    latitude,

    longitude,

    placeId,

    type,

    subtitle,

    details,

    distanceFromPrevious:
      typeof distance ===
      "number"
        ? distance
        : typeof distance ===
            "string"
          ? distance
          : undefined,

    durationFromPrevious:
      duration,

    recommended:
      typeof raw.recommended ===
      "boolean"
        ? raw.recommended
        : undefined,

    sequence:
      index + 1,

    ...raw,
  };
}


// ============================================================
// BUILD COMPLETE ROUTE STOPS
// ============================================================
//
// Important:
// Backend sirf intermediate stops bhej sakta hai.
//
// Example:
//
// backend:
//   Naudanda
//   Kusma
//   Beni
//
// frontend final:
//   Pokhara
//   Naudanda
//   Kusma
//   Beni
//   Kathmandu
//
// ============================================================

export function buildCompleteRouteStops(
  source: LocationData,
  destination: LocationData,
  rawStops: unknown[],
): RouteStop[] {
  const normalized: RouteStop[] =
    rawStops
      .map((item, index) =>
        normalizeRouteStop(
          item,
          index,
          rawStops.length,
        ),
      )
      .filter(
        (
          item,
        ): item is RouteStop =>
          Boolean(item),
      );

  const sourceName =
    source.name
      .trim()
      .toLowerCase();

  const destinationName =
    destination.name
      .trim()
      .toLowerCase();

  // ----------------------------------------------------------
  // REMOVE EMPTY / DUPLICATE STOPS
  // ----------------------------------------------------------

  const uniqueStops: RouteStop[] =
    [];

  const seen = new Set<string>();

  for (const stop of normalized) {
    const key =
      `${stop.name}`
        .trim()
        .toLowerCase();

    if (!key) {
      continue;
    }

    if (
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);

    uniqueStops.push(stop);
  }

  // ----------------------------------------------------------
  // SOURCE
  // ----------------------------------------------------------

  const sourceExistingIndex =
    uniqueStops.findIndex(
      (stop) =>
        stop.name
          .trim()
          .toLowerCase() ===
        sourceName,
    );

  const sourceStop: RouteStop =
    {
      id:
        sourceExistingIndex >= 0
          ? uniqueStops[
              sourceExistingIndex
            ].id
          : "source",

      name: source.name,

      address:
        source.address,

      latitude:
        source.latitude,

      longitude:
        source.longitude,

      placeId:
        source.placeId,

      type: "source",

      subtitle:
        "Start your trip from here",

      details:
        "Starting point",

      sequence: 1,
    };

  // Remove source from intermediate
  const withoutSource =
    uniqueStops.filter(
      (stop) =>
        stop.name
          .trim()
          .toLowerCase() !==
        sourceName,
    );

  // ----------------------------------------------------------
  // DESTINATION
  // ----------------------------------------------------------

  const withoutDestination =
    withoutSource.filter(
      (stop) =>
        stop.name
          .trim()
          .toLowerCase() !==
        destinationName,
    );

  const destinationStop: RouteStop =
    {
      id: "destination",

      name:
        destination.name,

      address:
        destination.address,

      latitude:
        destination.latitude,

      longitude:
        destination.longitude,

      placeId:
        destination.placeId,

      type: "destination",

      subtitle:
        "Your final destination",

      details:
        "Destination",

      sequence:
        withoutDestination.length +
        2,
    };

  // ----------------------------------------------------------
  // COMPLETE ROUTE
  // ----------------------------------------------------------

  const complete =
    [
      sourceStop,
      ...withoutDestination,
      destinationStop,
    ];

  // ----------------------------------------------------------
  // SEQUENCE + TYPE
  // ----------------------------------------------------------

  return complete.map(
    (stop, index) => {
      const isFirst =
        index === 0;

      const isLast =
        index ===
        complete.length - 1;

      return {
        ...stop,

        sequence:
          index + 1,

        type: isFirst
          ? "source"
          : isLast
            ? "destination"
            : stop.type ===
                "source" ||
              stop.type ===
                "destination"
              ? "stop"
              : stop.type,

        subtitle:
          isFirst
            ? "Start your trip from here"
            : isLast
              ? "Your final destination"
              : stop.subtitle ||
                "Next stop",

        details:
          isFirst
            ? "Starting point"
            : isLast
              ? "Destination"
              : stop.details ||
                "Next stop",
      };
    },
  );
}


// ============================================================
// SEARCH REAL LOCATIONS
//
// GET /api/v1/places/autocomplete?q=Delhi
// ============================================================

export async function searchPlaces(
  query: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<
  LocationSuggestion[]
> {
  const cleanQuery =
    query.trim();

  if (
    cleanQuery.length < 2
  ) {
    return [];
  }

  const response =
    await apiRequest<{
      suggestions?: LocationSuggestion[];
    }>(
      `/places/autocomplete?q=${encodeURIComponent(
        cleanQuery,
      )}`,
      {
        method: "GET",
        auth: false,
        signal:
          options?.signal,
      },
    );

  return (
    response.suggestions ||
    []
  );
}


// ============================================================
// GET SELECTED PLACE DETAILS
//
// GET /api/v1/places/details?placeId=xxxxx
// ============================================================

export async function getPlaceDetails(
  placeId: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<LocationData> {
  if (!placeId) {
    throw new Error(
      "Place ID is required",
    );
  }

  const response =
    await apiRequest<{
      location: LocationData;
    }>(
      `/places/details?placeId=${encodeURIComponent(
        placeId,
      )}`,
      {
        method: "GET",
        auth: false,
        signal:
          options?.signal,
      },
    );

  if (!response.location) {
    throw new Error(
      "Location details not found",
    );
  }

  return response.location;
}


// ============================================================
// PLAN COMPLETE ROUTE
//
// POST /api/v1/routes/plan
// ============================================================
//
// This function sends the source + destination to backend.
// Backend is responsible for calculating the actual route
// and returning intermediate villages/towns/stops.
//
// The frontend then normalizes that response into:
//
// Source
//   ↓
// Stop 1
//   ↓
// Stop 2
//   ↓
// ...
//   ↓
// Destination
// ============================================================

export async function planRoute(
  payload: RouteSearchData,
): Promise<RoutePlanResponse> {
  if (
    !payload?.source?.name
  ) {
    throw new Error(
      "Route source is required.",
    );
  }

  if (
    !payload?.destination?.name
  ) {
    throw new Error(
      "Route destination is required.",
    );
  }

  const cleanPayload: RouteSearchData =
    {
      source: {
        ...payload.source,
        name:
          payload.source.name.trim(),
      },

      destination: {
        ...payload.destination,
        name:
          payload.destination.name.trim(),
      },

      date:
        payload.date || "",

      travellers:
        Number(
          payload.travellers || 1,
        ),
    };

  console.log(
    "PLAN ROUTE REQUEST:",
    cleanPayload,
  );

  const response =
    await apiRequest<
      RoutePlanResponse
    >(
      "/routes/plan",
      {
        method: "POST",
        auth: false,
        body: cleanPayload,
      },
    );

  console.log(
    "PLAN ROUTE RAW RESPONSE:",
    response,
  );

  // ----------------------------------------------------------
  // Collect stops from all supported response fields.
  // ----------------------------------------------------------

  let rawStops: unknown[] =
    [];

  if (
    Array.isArray(
      response.stops,
    )
  ) {
    rawStops =
      response.stops;
  } else if (
    Array.isArray(
      response.intermediateStops,
    )
  ) {
    rawStops =
      response.intermediateStops;
  } else if (
    Array.isArray(
      response.route,
    )
  ) {
    rawStops =
      response.route;
  } else if (
    Array.isArray(
      response.waypoints,
    )
  ) {
    rawStops =
      response.waypoints;
  }

  // ----------------------------------------------------------
  // Build final complete journey.
  // ----------------------------------------------------------

  const completeStops =
    buildCompleteRouteStops(
      response.source ||
        cleanPayload.source,

      response.destination ||
        cleanPayload.destination,

      rawStops,
    );

  const normalizedResponse:
    RoutePlanResponse = {
      ...response,

      source:
        response.source ||
        cleanPayload.source,

      destination:
        response.destination ||
        cleanPayload.destination,

      date:
        response.date ||
        cleanPayload.date,

      travellers:
        response.travellers ||
        cleanPayload.travellers,

      stops:
        completeStops,

      intermediateStops:
        completeStops.filter(
          (stop) =>
            stop.type !==
              "source" &&
            stop.type !==
              "destination",
        ),

      route:
        completeStops,
    };

  console.log(
    "COMPLETE DYNAMIC ROUTE:",
    normalizedResponse,
  );

  return normalizedResponse;
}


// ============================================================
// GOOGLE MAPS ROUTE URL
// ============================================================
//
// Generates:
//
// Source
//   → Stop 1
//   → Stop 2
//   → Stop N
//   → Destination
//
// Google Maps waypoints are added dynamically.
// ============================================================

export function createGoogleMapsRouteUrl(
  source: LocationData,
  destination: LocationData,
  stops: RouteStop[] = [],
): string {
  const origin =
    source.name;

  const destinationName =
    destination.name;

  const intermediateStops =
    stops
      .filter(
        (stop) =>
          stop.type !==
            "source" &&
          stop.type !==
            "destination",
      )
      .map(
        (stop) =>
          stop.name,
      )
      .filter(Boolean);

  let url =
    "https://www.google.com/maps/dir/?api=1";

  url +=
    `&origin=${encodeURIComponent(
      origin,
    )}`;

  url +=
    `&destination=${encodeURIComponent(
      destinationName,
    )}`;

  if (
    intermediateStops.length
  ) {
    url +=
      `&waypoints=${encodeURIComponent(
        intermediateStops.join(
          "|",
        ),
      )}`;
  }

  url +=
    "&travelmode=driving";

  return url;
}


// ============================================================
// GOOGLE MAPS NAVIGATION URL
// ============================================================

export function createGoogleMapsNavigationUrl(
  source: LocationData,
  destination: LocationData,
  stops: RouteStop[] = [],
): string {
  return (
    createGoogleMapsRouteUrl(
      source,
      destination,
      stops,
    ) +
    "&dir_action=navigate"
  );
}


// ============================================================
// ROUTES
// ============================================================

export type RouteRecord = {
  id: number | string;

  name?: string;

  routeName?: string;

  title?: string;

  description?: string;

  source?: string;

  destination?: string;

  location?: string;

  distance?: number | string;

  duration?: string;

  imageUrl?: string | null;

  status?: string;

  approvalStatus?: string;

  activeStatus?: string;

  createdByName?: string;

  createdAt?: string;

  updatedAt?: string;

  /**
   * Optional intermediate stops.
   */
  stops?: RouteStop[];

  intermediateStops?: RouteStop[];

  [key: string]: unknown;
};


export async function listRoutes(): Promise<
  RouteRecord[]
> {
  const response =
    await apiRequest<unknown>(
      "/routes",
    );

  return extractArray<RouteRecord>(
    response,
  );
}


export async function createTrip(
  payload: Record<
    string,
    unknown
  >,
) {
  return apiRequest<unknown>(
    "/trips",
    {
      method: "POST",
      body: payload,
    },
  );
}


export async function updateRoute(
  id: number | string,
  payload: Record<
    string,
    unknown
  >,
) {
  return apiRequest<RouteRecord>(
    `/routes/${id}`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}


export async function deleteRoute(
  id: number | string,
) {
  return apiRequest<{
    message: string;
  }>(
    `/routes/${id}`,
    {
      method: "DELETE",
    },
  );
}


// ============================================================
// TRANSPORT
// ============================================================

export type TransportRecord = {
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

  createdAt: string;

  updatedAt: string;
};


export async function listTransport(): Promise<
  TransportRecord[]
> {
  const response =
    await apiRequest<unknown>(
      "/transport",
    );

  return extractArray<TransportRecord>(
    response,
  );
}


export async function createTransport(
  payload: Record<
    string,
    unknown
  >,
) {
  return apiRequest<TransportRecord>(
    "/transport",
    {
      method: "POST",
      body: payload,
    },
  );
}


export async function updateTransport(
  id: number | string,
  payload: Record<
    string,
    unknown
  >,
) {
  return apiRequest<TransportRecord>(
    `/transport/${id}`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}


export async function deleteTransport(
  id: number | string,
) {
  return apiRequest<{
    message: string;
  }>(
    `/transport/${id}`,
    {
      method: "DELETE",
    },
  );
}


// ============================================================
// HOTELS
// ============================================================

export type HotelRecord = {
  id: number;

  hotelName: string;

  propertyType: string;

  contactPerson: string;

  phoneNumber: string;

  location: string;

  latitude: number;

  longitude: number;

  checkInTime: string;

  checkOutTime: string;

  availabilityStatus: string;

  partnerStatus: string;

  imageUrl?: string | null;

  approvalStatus: string;

  createdAt: string;

  updatedAt: string;

  createdByName: string;
};


export async function listHotels(): Promise<
  HotelRecord[]
> {
  const response =
    await apiRequest<unknown>(
      "/hotels",
    );

  return extractArray<HotelRecord>(
    response,
  );
}


export async function createHotel(
  payload: Record<
    string,
    unknown
  >,
) {
  return apiRequest<HotelRecord>(
    "/hotels",
    {
      method: "POST",
      body: payload,
    },
  );
}


export async function updateHotel(
  id: number | string,
  payload: Record<
    string,
    unknown
  >,
) {
  return apiRequest<HotelRecord>(
    `/hotels/${id}`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}


export async function deleteHotel(
  id: number | string,
) {
  return apiRequest<{
    message: string;
  }>(
    `/hotels/${id}`,
    {
      method: "DELETE",
    },
  );
}


// ============================================================
// HOTEL ROOM TYPES
// ============================================================

export type RoomType = {
  id: string;

  name: string;

  type:
    | "AC"
    | "Non-AC";

  pricePerNight: number;

  capacity: number;

  available: boolean;

  description?: string;
};


export async function getHotelRooms(
  hotelId: number | string,
): Promise<RoomType[]> {
  const response =
    await apiRequest<unknown>(
      `/hotels/${hotelId}/rooms`,
    );

  return extractArray<RoomType>(
    response,
  );
}


// ============================================================
// GUIDES
// ============================================================

export type GuideRecord = {
  id: number | string;

  guideName?: string;

  name?: string;

  contactPerson?: string;

  phoneNumber?: string;

  email?: string;

  location?: string;

  language?: string;

  languages?: string[];

  experience?: number | string;

  experienceYears?: number | string;

  description?: string;

  imageUrl?: string | null;

  photoUrl?: string | null;

  status?: string;

  approvalStatus?: string;

  activeStatus?: string;

  createdByName?: string;

  createdAt?: string;

  updatedAt?: string;
};


export async function listGuides(): Promise<
  GuideRecord[]
> {
  const response =
    await apiRequest<unknown>(
      "/guides",
    );

  return extractArray<GuideRecord>(
    response,
  );
}


export async function createGuide(
  payload: Record<
    string,
    unknown
  >,
) {
  return apiRequest<GuideRecord>(
    "/guides",
    {
      method: "POST",
      body: payload,
    },
  );
}


export async function updateGuide(
  id: number | string,
  payload: Record<
    string,
    unknown
  >,
) {
  return apiRequest<GuideRecord>(
    `/guides/${id}`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}


export async function deleteGuide(
  id: number | string,
) {
  return apiRequest<{
    message: string;
  }>(
    `/guides/${id}`,
    {
      method: "DELETE",
    },
  );
}


// ============================================================
// ACTIVITIES
// ============================================================

export type ActivityRecord = {
  id: number | string;

  activityName?: string;

  name?: string;

  title?: string;

  description?: string;

  location?: string;

  category?: string;

  price?: number;

  currency?: string;

  duration?: string;

  imageUrl?: string | null;

  status?: string;

  approvalStatus?: string;

  activeStatus?: string;

  createdByName?: string;

  createdAt?: string;

  updatedAt?: string;
};


export async function listActivities(): Promise<
  ActivityRecord[]
> {
  const response =
    await apiRequest<unknown>(
      "/activities",
    );

  return extractArray<ActivityRecord>(
    response,
  );
}


export async function createActivity(
  payload: Record<
    string,
    unknown
  >,
) {
  return apiRequest<ActivityRecord>(
    "/activities",
    {
      method: "POST",
      body: payload,
    },
  );
}


export async function updateActivity(
  id: number | string,
  payload: Record<
    string,
    unknown
  >,
) {
  return apiRequest<ActivityRecord>(
    `/activities/${id}`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}


export async function deleteActivity(
  id: number | string,
) {
  return apiRequest<{
    message: string;
  }>(
    `/activities/${id}`,
    {
      method: "DELETE",
    },
  );
}


// ============================================================
// RESTAURANTS
// ============================================================

export type RestaurantRecord = {
  id: number | string;

  restaurantName: string;

  location: string;

  contactDetails: string;

  cuisineTypes: string[];

  openingHours: string;

  priceRange: string;

  imageUrl?: string | null;

  photos?: string[];

  recommendedDishes?: string[];

  approvalStatus: string;

  createdByName: string;

  createdAt: string;

  updatedAt: string;
};


// ============================================================
// LIST RESTAURANTS
// GET /api/v1/restaurants
// ============================================================

export async function listRestaurants(): Promise<
  RestaurantRecord[]
> {
  const response =
    await apiRequest<unknown>(
      "/restaurants",
      {
        method: "GET",
      },
    );

  return extractArray<RestaurantRecord>(
    response,
  );
}


// ============================================================
// CREATE RESTAURANT
// POST /api/v1/restaurants
// ============================================================

export async function createRestaurant(
  payload: Record<
    string,
    unknown
  >,
): Promise<RestaurantRecord> {
  return apiRequest<RestaurantRecord>(
    "/restaurants",
    {
      method: "POST",
      body: payload,
    },
  );
}


// ============================================================
// UPDATE RESTAURANT
// PATCH /api/v1/restaurants/:id
// ============================================================

export async function updateRestaurant(
  id: number | string,
  payload: Record<
    string,
    unknown
  >,
): Promise<RestaurantRecord> {
  if (
    id === undefined ||
    id === null ||
    String(id).trim() ===
      ""
  ) {
    throw new Error(
      "Restaurant ID is required for update.",
    );
  }

  return apiRequest<RestaurantRecord>(
    `/restaurants/${id}`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}


// ============================================================
// DELETE RESTAURANT
// DELETE /api/v1/restaurants/:id
// ============================================================

export async function deleteRestaurant(
  id: number | string,
): Promise<{
  message: string;
}> {
  if (
    id === undefined ||
    id === null ||
    String(id).trim() ===
      ""
  ) {
    throw new Error(
      "Restaurant ID is required for delete.",
    );
  }

  return apiRequest<{
    message: string;
  }>(
    `/restaurants/${id}`,
    {
      method: "DELETE",
    },
  );
}


// ============================================================
// BOOKINGS
// ============================================================

export type BookingRequest = {
  hotelId: string;

  roomTypeId: string;

  checkIn: string;

  checkOut: string;

  guests: number;
};


export type BookingResponse = {
  id?: number | string;

  hotelId?: string;

  roomTypeId?: string;

  checkIn?: string;

  checkOut?: string;

  guests?: number;

  totalPrice?: number;

  status?: string;

  message?: string;
};


export async function createBooking(
  payload: BookingRequest,
) {
  return apiRequest<BookingResponse>(
    "/bookings",
    {
      method: "POST",
      body: payload,
    },
  );
}


// ============================================================
// WORKFLOW
// ============================================================

export type WorkflowLogRecord = {
  id: number;

  entityType:
    | "Transport"
    | "Route"
    | "Hotel"
    | "Restaurant"
    | "Activity"
    | "Guide";

  entityId: string;

  entityTitle: string;

  previousStatus: string;

  newStatus: string;

  changedByRole: string;

  changedByName: string;

  comment?: string | null;

  timestamp: string;
};


export type WorkflowStatusPayload = {
  status: string;

  comment?: string;

  changed_by_role?: string;

  changed_by_name?: string;

  changedByRole?: string;

  changedByName?: string;
};


export async function updateWorkflowStatus(
  entityType:
    WorkflowLogRecord["entityType"],

  entityId:
    | number
    | string,

  payload:
    WorkflowStatusPayload,
) {
  return apiRequest<{
    message: string;

    entityType: string;

    entityId: string;

    status: string;
  }>(
    `/workflow/${entityType}/${entityId}/status`,
    {
      method: "POST",

      body: {
        status:
          payload.status,

        comment:
          payload.comment,

        changed_by_role:
          payload.changed_by_role ??
          payload.changedByRole,

        changed_by_name:
          payload.changed_by_name ??
          payload.changedByName,
      },
    },
  );
}


export async function listWorkflowLogs(): Promise<
  WorkflowLogRecord[]
> {
  const response =
    await apiRequest<unknown>(
      "/workflow/logs",
    );

  return extractArray<WorkflowLogRecord>(
    response,
  );
}


// ============================================================
// HEALTH CHECK
// ============================================================

export async function healthCheck() {
  return apiRequest(
    "/health",
    {
      auth: false,
    },
  );
}