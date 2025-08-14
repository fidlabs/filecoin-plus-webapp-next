import { z } from "zod";

export type NumericalString = `${"-" | ""}${number}`;

const numericalStringRegex = /^-?[0-9]{1,}$/;

export const numericalStringSchema = z
  .string()
  .refine((input): input is NumericalString => {
    return numericalStringRegex.test(input);
  });
