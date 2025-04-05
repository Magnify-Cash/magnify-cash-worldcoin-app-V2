export function calculateRemainingTime(
  startTime: bigint,
  loanPeriod: bigint,
): [number, number, number, Date] {
  // Convert startTime to milliseconds first
  const startTimeMs = startTime * 1000n;
  const loanPeriodMs = loanPeriod * 1000n;
  const currentTimeInMilliseconds = BigInt(Date.now());
  // Calculate the end time of the loan in milliseconds
  const endTimeInMilliseconds = startTimeMs + loanPeriodMs;

  // Rest of the function remains the same
  let remainingTimeInMilliseconds = endTimeInMilliseconds - currentTimeInMilliseconds;
  if (remainingTimeInMilliseconds <= 0n) {
    return [0, 0, 0, new Date(Number(endTimeInMilliseconds))];
  }

  const millisecondsPerDay = 86400000n;
  const millisecondsPerHour = 3600000n;
  const millisecondsPerMinute = 60000n;

  const daysRemaining = Number(remainingTimeInMilliseconds / millisecondsPerDay);
  remainingTimeInMilliseconds %= millisecondsPerDay;
  const hoursRemaining = Number(remainingTimeInMilliseconds / millisecondsPerHour);
  remainingTimeInMilliseconds %= millisecondsPerHour;
  const minutesRemaining = Number(remainingTimeInMilliseconds / millisecondsPerMinute);

  // Create date directly from milliseconds
  const dueDate = new Date(Number(endTimeInMilliseconds));
  return [daysRemaining, hoursRemaining, minutesRemaining, dueDate];
}
