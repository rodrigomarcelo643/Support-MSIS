export type ClassValue = string | number | boolean | undefined | null;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format relative time string e.g. "Just now", "5 mins ago", "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(dateInput?: string | Date | number | null): string {
  if (!dateInput) return 'Just now';

  // If already a pre-formatted relative string
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (trimmed === 'Just now' || /^\d+\s+(min|hour|day|week|month|year)s?\s+ago$/i.test(trimmed)) {
      return trimmed;
    }
  }

  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (!date || isNaN(date.getTime())) {
    // If not parseable as a Date, return input if string, else 'Just now'
    return typeof dateInput === 'string' ? dateInput : 'Just now';
  }

  const now = Date.now();
  const diffInSeconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));

  if (diffInSeconds < 60) {
    return 'Just now';
  }
  if (diffInSeconds < 3600) {
    const mins = Math.max(1, Math.floor(diffInSeconds / 60));
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format count for badges and notification counters.
 * If count > 99, returns "99+" instead of 100, 101, etc.
 */
export function formatBadgeCount(count: number): string {
  if (count > 99) return '99+';
  return count.toString();
}
