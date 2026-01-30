import { z } from "zod";

export type NumericalString = `${"-" | ""}${number}`;

const numericalStringRegex = /^-?\d{1,}$/;

export const numericalStringSchema = z
  .string()
  .refine((input): input is NumericalString => {
    return numericalStringRegex.test(input);
  });

export type DecimalString = `${"-" | ""}${number}${`.${number}` | ""}`;

const decimalStringRegex = /^-?\d{1,}(?:\.\d+)?$/;

export const decimalStringSchema = z
  .string()
  .refine((input): input is DecimalString => {
    return decimalStringRegex.test(input);
  });
