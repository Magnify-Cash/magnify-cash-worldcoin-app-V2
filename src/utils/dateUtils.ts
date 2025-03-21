
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * Formats a date to a user's local timezone with a specified format
 */
export function formatToLocalTime(date: Date, formatStr: string = 'h:mma, do MMM yyyy'): string {
  return format(date, formatStr);
}

/**
 * Formats a date to a specific timezone with a specified format
 */
export function formatToTimezone(
  date: Date, 
  timezone: string = 'GMT', 
  formatStr: string = 'h:mma zzz, do MMM yyyy'
): string {
  return formatInTimeZone(date, timezone, formatStr);
}

/**
 * Formats a date range for display (start date - end date)
 */
export function formatDateRange(
  startDate: Date,
  endDate: Date,
  formatStr: string = 'd MMM'
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
