
export function calculateRemainingTime(
  startTime: bigint,
  loanPeriod: bigint,
): [number, number, number, Date] {
  // Convert startTime to milliseconds first
  const startTimeMs = Number(startTime) * 1000;
  const loanPeriodMs = Number(loanPeriod) * 1000;
  const currentTimeInMilliseconds = Date.now();
  // Calculate the end time of the loan in milliseconds
  const endTimeInMilliseconds = startTimeMs + loanPeriodMs;

  // Rest of the function remains the same
  let remainingTimeInMilliseconds = endTimeInMilliseconds - currentTimeInMilliseconds;
  if (remainingTimeInMilliseconds <= 0) {
    return [0, 0, 0, new Date(Number(endTimeInMilliseconds))];
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
  const dueDate = new Date(Number(endTimeInMilliseconds));
  return [daysRemaining, hoursRemaining, minutesRemaining, dueDate];
}
