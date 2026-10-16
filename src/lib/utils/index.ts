import { SignalStrength, UserPresenceStatus } from '../../types';

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function getSignalStrength(distanceMeters: number): SignalStrength {
  if (distanceMeters < 10) return 'strong';
  if (distanceMeters < 50) return 'good';
  if (distanceMeters < 100) return 'fair';
  return 'weak';
}

export function getSignalBars(strength: SignalStrength): number {
  switch (strength) {
    case 'strong': return 4;
    case 'good': return 3;
    case 'fair': return 2;
    case 'weak': return 1;
    default: return 1;
  }
}

export function getPresenceStatus(lastActiveAt: string): UserPresenceStatus {
  const diffMs = Date.now() - new Date(lastActiveAt).getTime();
  const diffMins = diffMs / (1000 * 60);
  if (diffMins < 5) return 'online';
  if (diffMins < 30) return 'away';
  return 'offline';
}

export function getPresenceColor(status: UserPresenceStatus): string {
  switch (status) {
    case 'online': return '#10B981';
    case 'away': return '#F59E0B';
    case 'offline': return '#6B7280';
    default: return '#6B7280';
  }
}

export function formatRelativeTime(timestamp: string): string {
  const diffSecs = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diffSecs < 60) return 'Just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}