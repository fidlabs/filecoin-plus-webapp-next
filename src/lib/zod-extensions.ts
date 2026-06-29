import { z } from "zod";

export type NumericalString = `${"-" | ""}${number}`;

const numericalStringRegex = /^-?\d{1,}$/;

export const numericalStringSchema = z
  .custom<NumericalString>()
  .refine((input) => {
    return typeof input === "string" && numericalStringRegex.test(input);
  });

export type DecimalString = `${"-" | ""}${number}${`.${number}` | ""}`;

const decimalStringRegex = /^-?\d{1,}(?:\.\d+)?$/;

export const decimalStringSchema = z.custom<DecimalString>().refine((input) => {
  return typeof input === "string" && decimalStringRegex.test(input);
});
