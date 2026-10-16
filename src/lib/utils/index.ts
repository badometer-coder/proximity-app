import { SignalStrength, UserPresenceStatus } from '../../types';

export const formatDistance = (meters: number): string => {
  if (meters < 10) return 'Just here';
  if (meters < 1000) return `${Math.round(meters)}m away`;
  return `${(meters / 1000).toFixed(1)}km away`;
};

export const getSignalStrength = (distanceMeters: number): SignalStrength => {
  if (distanceMeters <= 5) return 'excellent';
  if (distanceMeters <= 15) return 'good';
  if (distanceMeters <= 30) return 'fair';
  return 'weak';
};

export const getSignalBars = (strength: SignalStrength): number => {
  switch (strength) {
    case 'excellent': return 4;
    case 'good': return 3;
    case 'fair': return 2;
    case 'weak': return 1;
    case 'none': return 0;
    default: return 0;
  }
};

export const getPresenceStatus = (lastActiveAt: string): UserPresenceStatus => {
  const diffMs = Date.now() - new Date(lastActiveAt).getTime();
  const diffMins = diffMs / (1000 * 60);
  if (diffMins < 5) return 'online';
  if (diffMins < 30) return 'recently';
  return 'offline';
};

export const getPresenceColor = (status: UserPresenceStatus): string => {
  switch (status) {
    case 'online': return '#10B981';
    case 'recently': return '#F59E0B';
    case 'offline': return '#6B7280';
    default: return '#6B7280';
  }
};

export const formatRelativeTime = (dateString: string): string => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};