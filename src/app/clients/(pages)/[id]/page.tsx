import { LatestClaims } from "@/app/clients/(pages)/[id]/components/latest-claims";
import { getClientLatestClaimsByClientId } from "@/lib/api";
import { IApiQuery } from "@/lib/interfaces/api.interface";
import { Suspense } from "react";

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
    sort: searchParams?.sort ?? "createdAt",
    order: searchParams?.order ?? "desc",
  };

  const data = await getClientLatestClaimsByClientId(clientId, currentParams);

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
