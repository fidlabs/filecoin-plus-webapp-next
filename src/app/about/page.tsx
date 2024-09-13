import ReactMarkdown from 'react-markdown';

import {cn} from "@/lib/utils";
import {Card, CardContent} from "@/components/ui/card";
import {Metadata} from "next";
import {buttonVariants} from "@/components/ui/button";
import {PageTitle} from "@/components/ui/title";

const markdownText = `
### About Fil+

Filecoin Plus is a layer of social trust on top of the Filecoin Network to help incentivize the storage of real data. Root key-holders, allocators, clients, and storage providers, interact through the allocation and spending of DataCap. You can read more about the Fil+ program [here](https://docs.filecoin.io/store/filecoin-plus/).

Clients looking to utilize storage on the network apply to receive DataCap from Allocators, which can be used to incentivize storage providers to make storage deals. Allocators are community-elected trustees responsible for allocating DataCap to parties storing useful data on the network. Storage Providers that receive DataCap receive a 10x boost to their quality-adjusted power for the storage space offered in that deal, which increases their block reward share in the network. This creates a mechanism that incentivizes all participants to make Filecoin more useful.

The goal of this site is to provide metrics, insights, and audit accountability tools for the Filecoin Plus community. You can see health statistics of the overall program, along with tables of data to track the interactions between the stakeholders (Allocators, Clients, and Storage Providers). This site was created by Digital M.O.B. in collaboration with Protocol Labs and the Filecoin Foundation providing development grants.

### Dashboard:

You can check some quick statistics and metrics about the Fil+ program, such as number of allocators, clients, and storage providers. You can also see number and size of deals, along with quantity of DataCap allocated to allocators.

### Allocators:

*List of allocators and info about them*

Search for a allocator by ID or Address. Audit details like number & address of clients verified by each allocator, along with DataCap allocated vs available by the allocator

Are you a client looking for a Allocator? [https://plus.fil.org/](https://plus.fil.org/)

Interested in learning more about allocators or becoming one? Check out this blog about elections, and learn more in our [GitHub repo](https://github.com/filecoin-project/allocator-governance)

### Clients

*Metrics about verified clients*

Search for clients by Verified Client ID, Address, or Allocator ID. Track number of verified deals by a client, along with discrete number of storage providers that client is working with, and client's DataCap available vs allocated.
Note: clients that receive automatic DataCap allocations from the [verify.glif.io](https://verify.glif.io) site maintained by the Infinite Scroll allocator are marked as "Glif auto verified".

Are you a client hoping to get verified and receive DataCap? [https://plus.fil.org/](https://plus.fil.org/)

### Storage Providers

*Active storage providers storing verified data*

Find a storage provider by ID. See number of verified deals per storage provider ID, number of verified clients per storage provider, total DataCap received, and average deal details.

Are you a storage provider hoping to store verified data and increase your quality-adjusted power? Find clients in #fil-deal-market in Filecoin Slack, and add yourself to the Fil+ storage provider registry [here](https://github.com/filecoin-project/filecoin-plus-client-onboarding/blob/main/miners.md)!

### Statistics

*Metrics and statistics for overall activity within the Fil+ program*

Statistics here are calculated through data available in GitHub and on chain.

Looking for more dashboards about the overall Filecoin Network? Check out [filplus.info](https://filplus.info/) and [this resource page](https://docs.filecoin.io/reference/#network-status).

Have a question or feedback on this site? Contact us or start an Issue in our GitHub!

### API

If you need to query our APIs for specific data, you can find the documentation [here](https://documenter.getpostman.com/view/131998/Tzsim4NU#intro).

`;

export const metadata: Metadata = {
  title: "About Fil+ Dashboard",
  description: "About Fil+ Dashboard",
}

export default function AboutPage() {
  return (
    <main className="flex flex-col gap-8 row-start-2 items-start">
      <PageTitle>About Fil+ Dashboard</PageTitle>
      <Card>
        <CardContent>
          <ReactMarkdown
            components={{
              h3: ({...props}) => (
                <h3 {...props} className={cn("text-2xl font-semibold mb-3 mt-6")}/>
              ),

              p: ({...props}) => (
                <p {...props} className={cn("my-3 leading-[1.5]")}/>
              ),
              a: ({...props}) => (
                <a {...props} className={buttonVariants({variant: "link"})} target="_blank" rel="noopener noreferrer"/>
              ),
            }}>
            {markdownText}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </main>
  );
}
