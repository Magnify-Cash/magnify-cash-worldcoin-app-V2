
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * Formats a date to a user's local timezone with a specified format
 */
export function formatToLocalTime(date: Date, formatStr: string = 'MMM d, yyyy'): string {
  return format(date, formatStr);
}

/**
 * Formats a date to a specific timezone with a specified format
 */
export function formatToTimezone(
  date: Date, 
  timezone: string = 'GMT', 
  formatStr: string = 'h:mma zzz, MMM d, yyyy'
): string {
  return formatInTimeZone(date, timezone, formatStr);
}

/**
 * Formats a date range for display (start date - end date)
 */
export function formatDateRange(
  startDate: Date,
  endDate: Date,
  formatStr: string = 'MMM d'
): string {
  return `${format(startDate, formatStr)} - ${format(endDate, formatStr)}`;
}

/**
 * Calculates the number of days between two dates
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Formats a date in a formal unlock message format
 */
export function formatUnlockDate(date: Date): string {
  const dayOfWeek = format(date, 'EEEE');
  const month = format(date, 'MMMM');
  const day = format(date, 'do');
  const year = format(date, 'yyyy');
  const time = format(date, 'h:mm a');
  
  return `${dayOfWeek}, ${month} ${day}, ${year} at ${time}`;
}
