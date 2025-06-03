import { Card } from "@/components/ui/card";
import { getAllocators } from "@/lib/api";
import Link from "next/link";
import { type PropsWithChildren } from "react";

export const revalidate = 3600;

type Props = PropsWithChildren<{
  params: { id: string };
}>;

export async function getMetaallocatorName(
  metaallocatorId: string
): Promise<string> {
  const response = await getAllocators({
    page: "1",
    limit: "1",
    filter: metaallocatorId,
  });

  const maybeName = response.data[0]?.name;

  return typeof maybeName === "string" && maybeName.length > 0
    ? maybeName
    : metaallocatorId;
}

export default async function MetaallocatorAllocatorsListLayout({
  children,
  params,
}: Props) {
  const metaallocatorName = await getMetaallocatorName(params.id);

  return (
    <main className="main-content">
      <Card className="mt-[50px]">
        <div className="px-4 pt-6">
          <h2 className="text-lg font-medium">
            Allocators under{" "}
            <Link className="underline" href={`/allocators/${params.id}`}>
              {metaallocatorName}
            </Link>
          </h2>
        </div>

        {children}
      </Card>
    </main>
  );
}
