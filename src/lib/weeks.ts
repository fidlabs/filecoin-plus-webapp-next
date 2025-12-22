import { endOfWeek, getWeek, getWeekYear, parse, startOfWeek } from "date-fns";
import { utc } from "@date-fns/utc";

export interface Week {
  weekNumber: number;
  year: number;
}

const stringRegex = /(\d+)W(\d+)/;
const readableStringRegex = /W(\d{1,2})'(\d{1,2})/;

export function weekFromDate(date: Date | string): Week {
  return {
    weekNumber: getWeek(date),
    year: getWeekYear(date),
  };
}

export function weekToUTCDate(week: Week): Date {
  const date = parse(
    `${week.year} ${week.weekNumber}`,
    "R I",
    new Date(0, 0, 0, 0, 0, 0, 0),
    { in: utc }
  );

  return date;
}

export function weekToString(week: Week): string {
  return `${week.year}W${week.weekNumber}`;
}

export function weekFromString(input: string): Week {
  const regexResult = stringRegex.exec(input);

  if (!regexResult || regexResult.length < 3) {
    throw new TypeError("Invalid week string");
  }

  return {
    weekNumber: parseInt(regexResult[2], 10),
    year: parseInt(regexResult[1], 10),
  };
}

export function safeWeekFromString(input: unknown): Week | undefined {
  if (typeof input !== "string") {
    return undefined;
  }

  try {
    return weekFromString(input);
  } catch (error) {
    return undefined;
  }
}

export interface WeekToReadableStingOptions {
  format?: "range" | "short";
}

const weekRangeFormatter = new Intl.DateTimeFormat("en-us", {
  day: "2-digit",
  month: "short",
  year: "2-digit",
});

export function weekToReadableString(
  week: Week,
  options: WeekToReadableStingOptions = {}
): string {
  const { format = "range" } = options;

  if (format === "range") {
    const date = weekToUTCDate(week);
    const startDate = startOfWeek(date);
    const endDate = endOfWeek(date);

    return weekRangeFormatter.formatRange(startDate, endDate);
  }

  return `W${week.weekNumber}'${week.year.toString().slice(-2)}`;
}

export function weekFromReadableString(readableString: string): Week {
  const regexResult = readableStringRegex.exec(readableString);

  if (!regexResult || regexResult.length < 3) {
    throw new TypeError("Invalid week readable string");
  }

  return {
    weekNumber: parseInt(regexResult[1], 10),
    year: parseInt(regexResult[2], 10) + 2000,
  };
}

export function safeWeekFromReadableString(
  readableString: unknown
): Week | undefined {
  if (typeof readableString !== "string") {
    return undefined;
  }

  try {
    return weekFromReadableString(readableString);
  } catch (error) {
    return undefined;
  }
}
