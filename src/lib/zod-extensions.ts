import { z } from "zod";
import { F0IdInput, isF0IdInput } from "./f0-id";

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

export const f0IdInputSchema = z.custom<F0IdInput>().refine(isF0IdInput);
