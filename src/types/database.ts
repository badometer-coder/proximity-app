export interface ProfileRow {
  id: string;
  username: string;
  full_name: string;
  age: number;
  avatar_url: string | null;
  public_key: string | null;
  is_ble_discoverable: boolean;
  location: string | null;
  last_active_at: string;
  created_at: string;
}

export interface MessageRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  transport_mode: 'CLOUD_WEBSOCKET' | 'P2P_SOCKET';
  sent_at: string;
  synced_at: string;
  is_synced: boolean;
}

export interface GetNearbyPeersResult {
  id: string;
  username: string;
  full_name: string;
  age: number;
  avatar_url: string | null;
  is_ble_discoverable: boolean;
  distance_meters: number;
  last_active_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: ProfileRow; Update: Partial<ProfileRow>; Relationships: [] };
      messages: { Row: MessageRow; Insert: MessageRow; Update: Partial<MessageRow>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      get_nearby_peers: { Args: { user_lat: number; user_lon: number; radius_meters?: number; exclude_user_id?: string }; Returns: GetNearbyPeersResult[] };
    };
    Enums: { transport_mode: ['CLOUD_WEBSOCKET', 'P2P_SOCKET'] };
  };
}