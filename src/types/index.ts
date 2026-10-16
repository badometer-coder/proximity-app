export type SignalStrength = 'weak' | 'moderate' | 'strong' | 'very_strong';

export type UserPresenceStatus = 'online' | 'away' | 'offline' | 'busy';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
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
  bio: string | null;
  is_ble_discoverable: boolean;
  created_at: string;
  updated_at: string;
}

export type Profile = UserProfile;

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface BLEAdvertisedDevice {
  id: string;
  uuid: string;
  rssi: number;
  name?: string;
  txPowerLevel?: number;
  manufacturerData?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export type ThemeMode = 'light' | 'dark' | 'system';