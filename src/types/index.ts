export type TransportMode = 'CLOUD_WEBSOCKET' | 'P2P_SOCKET';
export type RadiusFilter = number;
export type AppMode = 'ONLINE_GPS' | 'OFFLINE_BLE';
export type MessageDeliveryStatus = 'sending' | 'synced' | 'pending_sync' | 'failed';
export type UserPresenceStatus = 'online' | 'recently_active' | 'offline';
export type SignalStrength = 'excellent' | 'good' | 'fair' | 'weak';
export type LocationPermissionStatus = 'undetermined' | 'granted' | 'denied' | 'restricted';

export interface RadiusFilterOption {
  value: RadiusFilter;
  label: string;
  shortLabel: string;
}

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

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

