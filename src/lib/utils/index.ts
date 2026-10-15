import type { SignalStrength, UserPresenceStatus } from '../../types';

export const formatDistance = (meters: number): string => {
  if (meters < 0) return 'Unknown';
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

export const getSignalStrength = (distanceMeters: number): SignalStrength => {
  if (distanceMeters < 50) return 'excellent';
  if (distanceMeters < 200) return 'good';
  if (distanceMeters < 1000) return 'fair';
  return 'weak';
};

export const getSignalBars = (strength: SignalStrength): number => {
  switch (strength) {
    case 'excellent': return 4;
    case 'good': return 3;
    case 'fair': return 2;
    case 'weak': return 1;
  }
};

export const getPresenceStatus = (lastActiveAt: string): UserPresenceStatus => {
  const diffMinutes = (Date.now() - new Date(lastActiveAt).getTime()) / (1000 * 60);
  if (diffMinutes < 5) return 'online';
  if (diffMinutes < 30) return 'recently_active';
  return 'offline';
};

export const getPresenceColor = (status: UserPresenceStatus): string => {
  switch (status) {
    case 'online': return '#22C55E';
    case 'recently_active': return '#EAB308';
    case 'offline': return '#9CA3AF';
  }
};

export const formatRelativeTime = (dateString: string): string => {
  const diffSeconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return 'Yesterday';
};

export const getInitials = (name: string): string => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};