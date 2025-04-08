import { getClientById } from "@/lib/api";
import { IApiQuery } from "@/lib/interfaces/api.interface";
import { Suspense } from "react";
import { LatestClaims } from "@/app/clients/(pages)/[id]/components/latest-claims";

interface IPageProps {
  params: { id: string };
  searchParams: IApiQuery;
}

const ClientDetailsPage = async (pageParams: IPageProps) => {
  const clientId = pageParams.params.id;
  const searchParams = pageParams.searchParams;

  const currentParams = {
    page: searchParams?.page ?? "1",
    limit: searchParams?.limit ?? "15",
    filter: searchParams?.filter ?? "",
    sort: searchParams?.sort ?? `[["createdAt", 0]]`,
  };

  const data = await getClientById(clientId, currentParams);

  return (
    <div className="main-content">
      <Suspense>
        <LatestClaims
          clientId={clientId}
          data={data}
          searchParams={currentParams}
        />
      </Suspense>
    </div>
  );
};

export default ClientDetailsPage;
