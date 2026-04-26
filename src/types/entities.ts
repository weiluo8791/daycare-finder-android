export interface Daycare {
  id: string;
  name: string;
  nameLower: string;
  address: string;
  city: string;
  state?: string;
  lat: number;
  lng: number;
  geohash: string;
  phone?: string;
  email?: string;
  website?: string;
  photos: string[];
  description?: string;
  rating?: number;
  reviewSnippets: string[];
  hours?: Record<string, string>;
  priceRange?: string;
  licenseNumber?: string;
  capacity?: number;
  programType?: string;
  licensedStatus?: string;
  zipCode?: string;
  claimed: boolean;
  claimedByProviderId?: string;
  enrichmentStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  enrichmentStartedAt?: string;
  enrichedAt?: string;
  googlePlaceId?: string;
  yelpId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DaycareNearby extends Daycare {
  distanceMeters: number;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: string;
  image?: string;
  role: 'parent' | 'provider' | 'admin';
  createdAt: string;
}

export interface DaycareProvider {
  id: string;
  userId: string;
  verified: boolean;
  claimedDaycareId?: string;
  claimedDaycareIds?: string[];
  createdAt: string;
}

export interface ClaimRequest {
  id: string;
  providerId: string;
  daycareId: string;
  status: 'pending_email' | 'pending_admin' | 'approved' | 'rejected';
  token?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface SavedDaycare {
  userId: string;
  daycareId: string;
  createdAt: string;
}

export interface SearchParams {
  lat?: number;
  lng?: number;
  radius?: number;
  name?: string;
  cursor?: string;
  limit?: number | 'all';
}

export interface SearchResponse {
  daycares: DaycareNearby[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}
