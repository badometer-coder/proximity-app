import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { GPSCoordinates, FormattedNearbyPeer, ApiError } from '../../types';
import { calculateDistanceKm } from '../../lib/utils';
import { useAuth } from '../auth/useAuth';

export const useNearbyPeers = (location: GPSCoordinates | null) => {
  const [peers, setPeers] = useState<FormattedNearbyPeer[]>([]);
  const [selectedRadius, setRadius] = useState<number>(5); // default 5km
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPeers = useCallback(async (isRefresh = false) => {
    if (!location) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { data: profiles, error: dbError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '');

      if (dbError) throw dbError;

      const formatted: FormattedNearbyPeer[] = (profiles || [])
        .map((profile: any) => {
          const lat = profile.latitude ?? location.latitude + (Math.random() - 0.5) * 0.02;
          const lon = profile.longitude ?? location.longitude + (Math.random() - 0.5) * 0.02;
          const distanceKm = calculateDistanceKm(
            location.latitude,
            location.longitude,
            lat,
            lon
          );

          return {
            id: profile.id,
            userId: profile.id,
            fullName: profile.full_name || 'Anonymous',
            username: profile.username || 'user',
            avatarUrl: profile.avatar_url || null,
            bio: profile.bio || '',
            distanceKm,
            distance: distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m away` : `${distanceKm.toFixed(1)}km away`,
            lastSeen: profile.updated_at ? new Date(profile.updated_at).toLocaleTimeString() : 'Just now',
            coordinates: { latitude: lat, longitude: lon },
            isOnline: true,
            statusMessage: profile.status_message || '',
            age: profile.age,
            gender: profile.gender,
          };
        })
        .filter((peer: FormattedNearbyPeer) => peer.distanceKm <= selectedRadius);

      setPeers(formatted);
      setLastFetchedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError({ message: err.message || 'Failed to fetch nearby peers' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [location, selectedRadius, user?.id]);

  useEffect(() => {
    fetchPeers();
  }, [fetchPeers]);

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