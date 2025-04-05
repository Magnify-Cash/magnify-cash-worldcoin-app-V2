
export function calculateRemainingTime(
  startTime: number,
  loanPeriod: bigint,
): [number, number, number, Date] {
  // Convert startTime to milliseconds if not already
  const startTimeMs = startTime * 1000;
  const loanPeriodMs = Number(loanPeriod) * 1000;
  const currentTimeInMilliseconds = Date.now();
  // Calculate the end time of the loan in milliseconds
  const endTimeInMilliseconds = startTimeMs + loanPeriodMs;

  let remainingTimeInMilliseconds = endTimeInMilliseconds - currentTimeInMilliseconds;
  if (remainingTimeInMilliseconds <= 0) {
    return [0, 0, 0, new Date(endTimeInMilliseconds)];
  }

  const millisecondsPerDay = 86400000;
  const millisecondsPerHour = 3600000;
  const millisecondsPerMinute = 60000;

  const daysRemaining = Math.floor(remainingTimeInMilliseconds / millisecondsPerDay);
  remainingTimeInMilliseconds %= millisecondsPerDay;
  const hoursRemaining = Math.floor(remainingTimeInMilliseconds / millisecondsPerHour);
  remainingTimeInMilliseconds %= millisecondsPerHour;
  const minutesRemaining = Math.floor(remainingTimeInMilliseconds / millisecondsPerMinute);

  // Create date directly from milliseconds
  const dueDate = new Date(endTimeInMilliseconds);
  return [daysRemaining, hoursRemaining, minutesRemaining, dueDate];
}
