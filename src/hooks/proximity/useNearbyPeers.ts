import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import type { FormattedNearbyPeer, RadiusFilter, GPSCoordinates, ApiError } from '../../types';
import { formatDistance, getSignalStrength, getPresenceStatus } from '../../lib/utils';

interface UseNearbyPeersReturn {
  peers: FormattedNearbyPeer[];
  selectedRadius: RadiusFilter;
  isLoading: boolean;
  isRefreshing: boolean;
  error: ApiError | null;
  lastFetchedAt: string | null;
  setRadius: (radius: RadiusFilter) => void;
  refresh: () => Promise<void>;
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatPeer = (peer: any): FormattedNearbyPeer => ({
  ...peer,
  is_ble_discoverable: peer.is_ble_discoverable !== undefined ? peer.is_ble_discoverable : true,
  formatted_distance: formatDistance(peer.distance_meters),
  signal_strength: getSignalStrength(peer.distance_meters),
  presence_status: getPresenceStatus(peer.last_active_at),
});

export const useNearbyPeers = (currentLocation: GPSCoordinates | null): UseNearbyPeersReturn => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<RadiusFilter>(5000);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const lastFetchedAtRef = useRef(lastFetchedAt);
  const lastSavedLocationRef = useRef<GPSCoordinates | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => { lastFetchedAtRef.current = lastFetchedAt; }, [lastFetchedAt]);

  const fetchPeers = useCallback(async (loc?: GPSCoordinates) => {
    const locationToUse = loc || currentLocation;

    if (!locationToUse) {
      if (isMountedRef.current) setError({ code: 'NO_LOCATION', message: 'Location not available.' });
      return;
    }

    const now = Date.now();
    const elapsed = now - lastFetchTimeRef.current;
    const hasLastFetched = lastFetchedAtRef.current !== null;

    if (hasLastFetched && elapsed < 10000) return;

    try {
      if (!hasLastFetched && isMountedRef.current) setIsLoading(true);
      else if (isMountedRef.current) setIsRefreshing(true);

      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      let data;
      let rpcError;
      try {
        const result = await supabase.rpc('get_nearby_peers', {
          user_lat: locationToUse.latitude,
          user_lon: locationToUse.longitude,
          radius_meters: selectedRadius,
          exclude_user_id: userId,
        } as any);
        data = result.data;
        rpcError = result.error;
      } catch (innerErr) {
        throw innerErr;
      }

      if (rpcError) throw rpcError;

      if (isMountedRef.current) {
        const rawData = data as any[] | null;

        const mappedData: FormattedNearbyPeer[] = [];

        if (rawData) {
          for (let index = 0; index < rawData.length; index++) {
            const peer = rawData[index];
            try {
              mappedData.push(formatPeer(peer));
            } catch (mapErr) {
              console.log('ERROR MAPPING USER:', mapErr);
            }
          }
        }

        setPeers(mappedData);
        setLastFetchedAt(new Date().toISOString());
        lastFetchTimeRef.current = Date.now();
      }
    } catch (err) {
      if (isMountedRef.current) setError({ code: 'FETCH_ERROR', message: err instanceof Error ? err.message : 'Failed to fetch' });
    } finally {
      if (isMountedRef.current) { setIsLoading(false); setIsRefreshing(false); }
    }
  }, [currentLocation, selectedRadius]);

  useEffect(() => {
    if (currentLocation) {
      const timer = setTimeout(() => {
        fetchPeers(currentLocation);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentLocation]);
  useEffect(() => { if (currentLocation && lastFetchedAtRef.current) fetchPeers(currentLocation); }, [selectedRadius]);

  useEffect(() => {
    if (!currentLocation) return;

    const shouldSave = !lastSavedLocationRef.current ||
      haversineDistance(
        lastSavedLocationRef.current.latitude,
        lastSavedLocationRef.current.longitude,
        currentLocation.latitude,
        currentLocation.longitude
      ) > 100;

    if (!shouldSave) return;

    const saveLocation = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      await (supabase as any).rpc('update_user_location', {
        user_id: session.user.id,
        new_lat: currentLocation.latitude,
        new_lon: currentLocation.longitude,
      });

      lastSavedLocationRef.current = currentLocation;
    };
    saveLocation();
  }, [currentLocation]);

  return {
    peers,
    selectedRadius,
    isLoading,
    isRefreshing,
    error,
    lastFetchedAt,
    setRadius: setSelectedRadius,
    refresh: fetchPeers,
  };
};