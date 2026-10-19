import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, FormattedNearbyPeer, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';
import { useBluetoothProximity } from './useBluetoothProximity';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const { discoveredDevices } = useBluetoothProximity();
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number>(500); // default 500 meters
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const { user } = useAuth();
  const locationRef = useRef(location);
  locationRef.current = location;

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const currentLocation = locationRef.current;
      if (!currentLocation || !user) {
        setPeers([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const { data, error: rpcError } = await supabase.rpc('get_nearby_peers' as any, {
        user_id: user.id,
        radius_meters: selectedRadius,
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
      } as any);

      if (rpcError) {
        throw {
          code: rpcError.code || 'UNKNOWN',
          message: rpcError.message,
          details: rpcError.details ? { details: rpcError.details } : undefined,
        };
      }

      if (data && Array.isArray(data)) {
        const formatted: FormattedNearbyPeer[] = (data as any[]).map((peer: any) => ({
          id: String(peer.id),
          username: String(peer.username),
          full_name: String(peer.full_name),
          age: Number(peer.age),
          avatar_url: peer.avatar_url ? String(peer.avatar_url) : null,
          is_ble_discoverable: Boolean(peer.is_ble_discoverable),
          distance_meters: Number(peer.distance_meters),
          last_active_at: String(peer.last_active_at),
          formatted_distance: formatDistance(Number(peer.distance_meters)),
          signal_strength: getSignalStrength(Number(peer.distance_meters)),
          presence_status: getPresenceStatus(String(peer.last_active_at)),
        })) as FormattedNearbyPeer[];

        setPeers(formatted);
        setLastFetchedAt(new Date().toISOString());
      } else {
        setPeers([]);
      }
    } catch (err: any) {
      setError({
        code: err.code || 'FETCH_ERROR',
        message: err.message || 'Failed to fetch nearby peers',
        details: err.details,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedRadius, user]);

  useEffect(() => {
    if (discoveredDevices.length > 0) {
      // Map BLE devices to the peers structure
      const blePeers: FormattedNearbyPeer[] = discoveredDevices.map((device: any) => ({
        id: device.id,
        username: device.localName || 'Unknown',
        full_name: device.name || 'Nearby Device',
        age: 0,
        avatar_url: null,
        is_ble_discoverable: true,
        distance_meters: 0,
        last_active_at: new Date().toISOString(),
        formatted_distance: 'Nearby',
        signal_strength: 'excellent',
        presence_status: 'online',
      }));
      setPeers(blePeers);
    }
  }, [discoveredDevices]);

  useEffect(() => {
    if (location) {
      const timer = setTimeout(() => { fetchPeers(); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location, fetchPeers]);

  const setRadius = (radius: number) => {
    setSelectedRadius(radius);
  };

  const refresh = async () => {
    await fetchPeers(true);
  };

  return {
    peers,
    selectedRadius,
    isLoading,
    isRefreshing,
    error,
    lastFetchedAt,
    setRadius,
    refresh,
  };
};