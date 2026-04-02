import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  try {
    return format(new Date(date), 'MMM dd, yyyy');
  } catch (e) {
    return String(date);
  }
}

export function timeAgo(date: Date | string): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (e) {
    return String(date);
  }
}

export function truncate(str: string, length: number): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

export function formatSalary(salary: string): string {
  if (!salary) return '';
  return salary.trim();
}

export function getBadgeClass(status: string): string {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case 'applied':
      return 'badge badge-applied';
    case 'screening':
      return 'badge badge-screening';
    case 'interview':
      return 'badge badge-interview';
    case 'offer':
      return 'badge badge-offer';
    case 'rejected':
      return 'badge badge-rejected';
    default:
      return 'badge';
  }
}
