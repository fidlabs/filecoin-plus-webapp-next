import { CompareType } from "@/lib/interfaces/cdp/cdp.interface";

export const compareReportValue = (value: number, compareValue: number) => {
  if (value === compareValue) {
    return "equal" as CompareType;
  }
  if (value < compareValue) {
    return "down" as CompareType;
  } else {
    return "up" as CompareType;
  }
};
