import { fetchStorageProvidersComplianceDataWeeks } from "@/app/storage-providers/storage-providers-data";
import { safeWeekFromString, weekToString } from "@/lib/weeks";
import { redirect } from "next/navigation";
import { type PropsWithChildren } from "react";

export const revalidate = 300;

type LayoutProps = PropsWithChildren<{
  params: { week: string };
}>;

export default async function CompliantStorageProvidersPage({
  children,
  params,
}: LayoutProps) {
  const weeks = await fetchStorageProvidersComplianceDataWeeks();
  const selectedWeek = safeWeekFromString(params.week);

  if (weeks.length === 0) {
    return redirect("/storage-providers");
  }

  if (
    !selectedWeek ||
    !weeks.some(
      (week) =>
        week.weekNumber === selectedWeek.weekNumber &&
        week.year === selectedWeek.year
    )
  ) {
    return redirect(`/storage-providers/compliance/${weekToString(weeks[0])}`);
  }

  return children;
}
