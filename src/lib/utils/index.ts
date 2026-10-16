import { SignalStrength, UserPresenceStatus } from '../../types';

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

export const getSignalStrength = (distanceMeters: number): SignalStrength => {
  if (distanceMeters < 50) return 'excellent';
  if (distanceMeters < 200) return 'good';
  if (distanceMeters < 500) return 'fair';
  if (distanceMeters < 1000) return 'weak';
  return 'none';
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

export const formatRelativeTime = (timestamp: string): string => {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const getInitials = (name: string): string => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const formatTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};