import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

export const PRIORITY_COLORS: Record<string, string> = {
  Highest: '#BC6C25',
  High: '#E9C46A',
  Medium: '#40916C',
  Low: '#2196F3',
  Lowest: '#8896A6',
};

export const ISSUE_TYPE_COLORS: Record<string, string> = {
  Epic: '#9B59B6',
  Story: '#40916C',
  Bug: '#BC6C25',
  Task: '#2196F3',
  'Sub-task': '#8896A6',
};

export const STATUS_COLORS: Record<string, string> = {
  todo: '#8896A6',
  in_progress: '#2196F3',
  in_review: '#E9C46A',
  done: '#40916C',
};

export const PRIORITY_ICONS: Record<string, string> = {
  Highest: '⬆⬆',
  High: '⬆',
  Medium: '—',
  Low: '⬇',
  Lowest: '⬇⬇',
};
