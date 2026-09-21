export const PANTRY_TIMEZONE = "America/New_York";

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: string;
};

function partMap(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    weekday: get("weekday"),
  };
}

export function getZonedParts(
  date: Date = new Date(),
  timeZone: string = PANTRY_TIMEZONE,
): ZonedParts {
  return partMap(date, timeZone);
}

export function getYearMonth(
  date: Date = new Date(),
  timeZone: string = PANTRY_TIMEZONE,
): { year: number; month: number } {
  const { year, month } = getZonedParts(date, timeZone);
  return { year, month };
}

export function isSameCalendarMonth(
  a: Date,
  b: Date = new Date(),
  timeZone: string = PANTRY_TIMEZONE,
): boolean {
  const left = getYearMonth(a, timeZone);
  const right = getYearMonth(b, timeZone);
  return left.year === right.year && left.month === right.month;
}

export function isSameCalendarDay(
  a: Date,
  b: Date = new Date(),
  timeZone: string = PANTRY_TIMEZONE,
): boolean {
  const left = getZonedParts(a, timeZone);
  const right = getZonedParts(b, timeZone);
  return left.year === right.year && left.month === right.month && left.day === right.day;
}

function offsetMs(date: Date, timeZone: string): number {
  const zoned = partMap(date, timeZone);
  const asUtc = Date.UTC(
    zoned.year,
    zoned.month - 1,
    zoned.day,
    zoned.hour,
    zoned.minute,
    0,
  );
  const localMinutes = date.getUTCSeconds() * 1000 + date.getUTCMilliseconds();
  return asUtc - (date.getTime() - localMinutes);
}

/** Build a Date for a civil date/time in the pantry timezone. */
export function fromZonedTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  timeZone: string = PANTRY_TIMEZONE,
): Date {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  let adjusted = new Date(utcGuess.getTime() - offsetMs(utcGuess, timeZone));
  adjusted = new Date(utcGuess.getTime() - offsetMs(adjusted, timeZone));
  return adjusted;
}

export function monthName(
  month: number,
  locale = "en-US",
): string {
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(
    new Date(2020, month - 1, 1),
  );
}

export function formatLongDate(
  date: Date,
  timeZone: string = PANTRY_TIMEZONE,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatShortDate(
  date: Date,
  timeZone: string = PANTRY_TIMEZONE,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTime(
  date: Date,
  timeZone: string = PANTRY_TIMEZONE,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatMonthYear(
  date: Date = new Date(),
  timeZone: string = PANTRY_TIMEZONE,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "long",
    year: "numeric",
  }).format(date);
}
