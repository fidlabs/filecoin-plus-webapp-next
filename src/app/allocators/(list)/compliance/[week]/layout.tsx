import { CDP_API_URL } from "@/lib/constants";
import { safeWeekFromString, weekFromDate, weekToString } from "@/lib/weeks";
import { redirect } from "next/navigation";
import { type PropsWithChildren } from "react";
import * as z from "zod";
import { AllocatorsComplianceFilters } from "./components/allocators-compliance-filters";
import { AllocatorsListAddons } from "@/app/allocators/components/allocators-list-addons";

type LayoutProps = PropsWithChildren<{
  params: { week: string };
}>;

type WeeksResponse = z.infer<typeof weeksResponseSchema>;

const weeksResponseSchema = z.object({
  results: z.array(
    z.object({
      week: z.string(),
    })
  ),
});

export const revalidate = 300;

function assertIsWeeksResponse(input: unknown): asserts input is WeeksResponse {
  const validationResult = weeksResponseSchema.safeParse(input);

  if (!validationResult.success) {
    throw new TypeError(
      "Invalid response from CDP while fetching SP complaince data"
    );
  }
}

async function fetchComplianceDataWeeks() {
  const response = await fetch(
    `${CDP_API_URL}/stats/acc/allocators/sps-compliance`
  );
  const json = await response.json();
  assertIsWeeksResponse(json);
  return json.results.map((result) => weekFromDate(result.week)).toReversed();
}

export default async function CompliantAllocatorsLayout({
  children,
  params,
}: LayoutProps) {
  const weeks = await fetchComplianceDataWeeks();
  const selectedWeek = safeWeekFromString(params.week);

  if (weeks.length === 0) {
    return redirect("/allocators");
  }

  if (
    !selectedWeek ||
    !weeks.some(
      (week) =>
        week.weekNumber === selectedWeek.weekNumber &&
        week.year === selectedWeek.year
    )
  ) {
    return redirect(`/allocators/compliance/${weekToString(weeks[0])}`);
  }

  return (
    <div>
      <div className="px-4 pt-6">
        <h2 className="text-lg font-medium mb-4">
          Allocators List by SPs Compliance
        </h2>

        <AllocatorsComplianceFilters
          selectedWeek={selectedWeek}
          weeks={weeks}
        />

        <AllocatorsListAddons className="mt-4" complianceWeek={selectedWeek} />
      </div>

      {children}
    </div>
  );
}
