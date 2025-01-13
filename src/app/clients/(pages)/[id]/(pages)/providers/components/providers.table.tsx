"use client";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import {cn, convertBytesToIEC, palette} from "@/lib/utils";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";
import {
  useClientProvidersDetails
} from "@/app/clients/(pages)/[id]/(pages)/providers/components/client-providers.provider";

const ProvidersTable = () => {
  const {providersData, activeProviderIndex, setActiveProviderIndex} = useClientProvidersDetails()

  return <div className="overflow-auto md:max-h-[calc(100vh-400px)]">
    <Table>
      <TableHeader>
        <TableCell>
          Provider
        </TableCell>
        <TableCell>
          % of total client used DataCap
        </TableCell>
        <TableCell>
          Total size
        </TableCell>
      </TableHeader>
      <TableBody>
        {
          providersData?.stats.map(({provider, percent, total_deal_size}, index) =>
            <TableRow key={index}
                      onMouseEnter={() => setActiveProviderIndex(index)}
                      onMouseLeave={() => setActiveProviderIndex(-1)}
                      style={{
                        backgroundColor: activeProviderIndex === index ? `${palette(index)}33` : 'transparent'
                      }}
            >
              <TableCell>
                <Link href={`/storage-providers/${provider}`} className={cn(buttonVariants({variant: 'link'}))}>
                  {provider}
                </Link>
              </TableCell>
              <TableCell>
                {percent}%
              </TableCell>
              <TableCell>
                {convertBytesToIEC(total_deal_size)}
              </TableCell>
            </TableRow>)
        }
      </TableBody>
    </Table>
  </div>

}

export {ProvidersTable}