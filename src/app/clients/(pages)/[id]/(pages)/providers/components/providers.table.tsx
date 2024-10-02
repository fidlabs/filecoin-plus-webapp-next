import {useClientDetails} from "@/app/clients/(pages)/[id]/components/client.provider";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import {cn, convertBytesToIEC, palette} from "@/lib/utils";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";

const ProvidersTable = () => {
  const {providersData, activeProviderIndex, setActiveProviderIndex} = useClientDetails()

  return <div className="max-h-[calc(100vh-300px)] overflow-auto md:max-h-[calc(100vh-400px)]">
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
                <Link href={`/providers/${provider}`} className={cn(buttonVariants({variant: 'link'}))}>
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