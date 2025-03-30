
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * Safely parses a date string or timestamp to a valid Date object
 */
export function safeParseDate(dateInput: string | number | Date | undefined | null): Date {
  if (!dateInput) {
    return new Date(); // Default to current date
  }
  
  try {
    // If it's already a Date object
    if (dateInput instanceof Date) {
      return isNaN(dateInput.getTime()) ? new Date() : dateInput;
    }
    
    // If it's a unix timestamp (seconds, not milliseconds)
    if (typeof dateInput === 'string' && /^\d+$/.test(dateInput) && dateInput.length === 10) {
      return new Date(parseInt(dateInput) * 1000);
    }
    
    // If it's a unix timestamp in milliseconds
    if (typeof dateInput === 'string' && /^\d+$/.test(dateInput)) {
      return new Date(parseInt(dateInput));
    }
    
    // Try to parse ISO or formatted date string
    const parsedDate = new Date(dateInput);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    
    // Fallback
    console.warn(`Invalid date input: ${dateInput}, using current date as fallback`);
    return new Date();
  } catch (error) {
    console.error("Error parsing date:", error);
    return new Date();
  }
}

/**
 * Formats a date to a user's local timezone with a specified format
 */
export function formatToLocalTime(date: Date | string | number, formatStr: string = 'MMM d, yyyy'): string {
  try {
    const safeDate = safeParseDate(date as string);
    return format(safeDate, formatStr);
  } catch (error) {
    console.error("Error in formatToLocalTime:", error);
    return "Invalid date";
  }
}

/**
 * Formats a date to a specific timezone with a specified format
 */
export function formatToTimezone(
  date: Date | string | number, 
  timezone: string = 'GMT', 
  formatStr: string = 'h:mma zzz, MMM d, yyyy'
): string {
  try {
    const safeDate = safeParseDate(date as string);
    return formatInTimeZone(safeDate, timezone, formatStr);
  } catch (error) {
    console.error("Error in formatToTimezone:", error);
    return "Invalid date";
  }
}

/**
 * Formats a date range for display (start date - end date)
 */
export function formatDateRange(
  startDate: Date | string | number,
  endDate: Date | string | number,
  formatStr: string = 'MMM d'
): string {
  try {
    const safeStartDate = safeParseDate(startDate as string);
    const safeEndDate = safeParseDate(endDate as string);
    return `${format(safeStartDate, formatStr)} - ${format(safeEndDate, formatStr)}`;
  } catch (error) {
    console.error("Error in formatDateRange:", error);
    return "Invalid date range";
  }
}

/**
 * Calculates the number of days between two dates
 */
export function getDaysBetween(startDate: Date | string | number, endDate: Date | string | number): number {
  try {
    const safeStartDate = safeParseDate(startDate as string);
    const safeEndDate = safeParseDate(endDate as string);
    const diffTime = Math.abs(safeEndDate.getTime() - safeStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error("Error in getDaysBetween:", error);
    return 0;
  }
}

/**
 * Formats a date in a formal unlock message format
 */
export function formatUnlockDate(date: Date | string | number): string {
  try {
    const safeDate = safeParseDate(date as string);
    const dayOfWeek = format(safeDate, 'EEEE');
    const month = format(safeDate, 'MMMM');
    const day = format(safeDate, 'do');
    const year = format(safeDate, 'yyyy');
    const time = format(safeDate, 'h:mm a');
    
    return `${dayOfWeek}, ${month} ${day}, ${year} at ${time}`;
  } catch (error) {
    console.error("Error in formatUnlockDate:", error);
    return "Invalid date";
  }
}
