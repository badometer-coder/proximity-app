export type UserPresenceStatus = 'online' | 'recently' | 'offline';

export type SignalStrength = 'excellent' | 'good' | 'fair' | 'weak' | 'none';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export type RadiusFilter = 100 | 500 | 1000 | 5000 | 10000;
export type RadiusFilterOption = RadiusFilter;

export interface NearbyPeer {
  id: string;
  username: string;
  full_name: string;
  age: number;
  avatar_url: string | null;
  is_ble_discoverable: boolean;
  distance_meters: number;
  last_active_at: string;
}

export interface FormattedNearbyPeer extends NearbyPeer {
  formatted_distance: string;
  signal_strength: SignalStrength;
  presence_status: UserPresenceStatus;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  age: number;
  avatar_url: string | null;
  bio?: string;
  is_ble_discoverable?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  sent_at: string;
  read: boolean;
  is_own_message?: boolean;
}