import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import isFinite from "lodash/isFinite";
import { filesize } from "filesize";
import { Metadata } from "next";
import { getWeek, getWeekYear } from "date-fns";

const mpn65 = [
  "#0091ff",
  "#ff0029",
  "#66a61e",
  "#984ea3",
  "#00d2d5",
  "#ff7f00",
  "#af8d00",
  "#7f80cd",
  "#b3e900",
  "#c42e60",
  "#a65628",
  "#f781bf",
  "#8dd3c7",
  "#bebada",
  "#fb8072",
  "#80b1d3",
  "#fdb462",
  "#fccde5",
  "#bc80bd",
  "#ffed6f",
  "#c4eaff",
  "#cf8c00",
  "#1b9e77",
  "#d95f02",
  "#e7298a",
  "#e6ab02",
  "#a6761d",
  "#0097ff",
  "#00d067",
  "#000000",
  "#252525",
  "#525252",
  "#737373",
  "#969696",
  "#bdbdbd",
  "#f43600",
  "#4ba93b",
  "#5779bb",
  "#927acc",
  "#97ee3f",
  "#bf3947",
  "#9f5b00",
  "#f48758",
  "#8caed6",
  "#f2b94f",
  "#eff26e",
  "#e43872",
  "#d9b100",
  "#9d7a00",
  "#698cff",
  "#d9d9d9",
  "#00d27e",
  "#d06800",
  "#009f82",
  "#c49200",
  "#cbe8ff",
  "#fecddf",
  "#c27eb6",
  "#8cd2ce",
  "#c4b8d9",
  "#f883b0",
  "#a49100",
  "#f48800",
  "#27d0df",
  "#a04a9b",
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertBytesToIEC = (bytes?: string | number | boolean) => {
  return bytes !== undefined && !isNaN(Number(bytes)) && isFinite(Number(bytes))
    ? filesize(Number(bytes), {
        standard: "iec",
      })
    : "N/A";
};

export const convertBytesToIECSimple = (bytes?: string | number | boolean) => {
  return bytes !== undefined && !isNaN(Number(bytes)) && isFinite(Number(bytes))
    ? +filesize(Number(bytes), {
        standard: "iec",
      }).split(" ")[0]
    : 0;
};

export const calculateTimestampFromHeight = (height: number) => {
  return 1598306400 + 30 * height;
};

export const calculateDateFromHeight = (timestamp: number) => {
  return new Date(
    calculateTimestampFromHeight(timestamp) * 1000
  ).toDateString();
};

export const calculateISODateFromHeight = (timestamp: number) => {
  return new Date(calculateTimestampFromHeight(timestamp) * 1000).toISOString();
};

export const palette = (step: number) => {
  return mpn65[step % mpn65.length];
};

const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const gradientPalette = (
  colorA: string,
  colorB: string,
  steps: number
) => {
  const start = hexToRgb(colorA);
  const end = hexToRgb(colorB);
  const stepFactor = 1 / (steps - 1);
  const gradient = [];

  for (let i = 0; i < steps; i++) {
    const r = Math.round(start.r + (end.r - start.r) * stepFactor * i);
    const g = Math.round(start.g + (end.g - start.g) * stepFactor * i);
    const b = Math.round(start.b + (end.b - start.b) * stepFactor * i);
    gradient.push(rgbToHex(r, g, b));
  }

  return gradient;
};

export const calculateAverage = (
  numbers: number[],
  decimalPlaces?: number
): number => {
  const average = (Math.max(...numbers) + Math.min(...numbers)) / 2;
  return decimalPlaces !== undefined
    ? parseFloat(average.toFixed(decimalPlaces))
    : average;
};

export const calculateMapScale = (locations: string[]): number => {
  if (locations.length === 0) return 1;

  const lats = locations.map((loc) => +loc.split(",")[0]);
  const lons = locations.map((loc) => +loc.split(",")[1]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const latDiff = maxLat - minLat;
  const lonDiff = maxLon - minLon;

  // Assuming a base scale factor, you can adjust this as needed
  const baseScale = 180;
  const scale = (100 * baseScale) / Math.min(latDiff, lonDiff);

  return Math.min(scale, 2000);
};

export const generatePageMetadata = (config: {
  title: string;
  description: string;
  url: string;
}) =>
  ({
    title: config.title,
    description: config.description,
    openGraph: {
      type: "website",
      locale: "en_US",
      title: config.title,
      description: config.description,
      url: config.url,
      siteName: "Fil+ DataCap Stats",
    },
    twitter: {
      title: config.title,
      description: config.description,
    },
  } as Metadata);

export function isPlainObject(
  input: unknown
): input is Record<string, unknown> {
  return !!input && typeof input === "object" && !Array.isArray(input);
}

export function groupBy<
  T,
  Key extends string,
  Keys extends readonly Key[] | void
>(
  input: readonly T[],
  groupFn: (item: T) => Key,
  keys?: Keys
): Keys extends void ? Partial<Record<Key, T[]>> : Record<Key, T[]> {
  type Result = Keys extends void
    ? Partial<Record<Key, T[]>>
    : Record<Key, T[]>;

  const initialValue =
    keys?.reduce((result, key) => {
      return {
        ...result,
        [key]: [],
      };
    }, {}) ?? {};

  return input.reduce((result, item) => {
    const itemGroup = groupFn(item);

    return {
      ...result,
      [itemGroup]: [...(result[itemGroup] ?? []), item],
    };
  }, initialValue as Result);
}

export function mapObject<InputType, MappedType, Key extends string>(
  input: Record<Key, InputType>,
  mapFn: (item: InputType) => MappedType
): Record<Key, MappedType> {
  const keys = Object.keys(input) as Key[];

  return keys.reduce((result, key) => {
    const item = input[key] as InputType;

    return {
      ...result,
      [key]: mapFn(item),
    };
  }, {}) as Record<Key, MappedType>; // All keys will be populated eventually so we can cast the type here
}

export function capitalize(input: string): string {
  return input
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function dateToYearWeek(input: Date | string): string {
  return `W${getWeek(input)}'${getWeekYear(input).toString().slice(-2)}`;
}
