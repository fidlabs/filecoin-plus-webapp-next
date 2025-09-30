import { LatestClaims } from "@/app/clients/(pages)/[id]/components/latest-claims";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveView } from "@/components/ui/responsive-view";
import { getClientLatestClaimsByClientId } from "@/lib/api";
import { IApiQuery } from "@/lib/interfaces/api.interface";
import { convertBytesToIEC } from "@/lib/utils";
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
        <div className="md:min-w-fit flex">
          <ResponsiveView>
            <div className="grid grid-cols-2 w-full p-4 pb-10 gap-4 md:my-6 md:p-0">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle>Total sum of DDO Piece Size</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {convertBytesToIEC(data.totalSumOfDdoPieceSize)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle>Total sum of non-DDO Piece Size</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {convertBytesToIEC(data.totalSumOfNonDdoPieceSize)}
                </CardContent>
              </Card>
            </div>
          </ResponsiveView>
        </div>
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
